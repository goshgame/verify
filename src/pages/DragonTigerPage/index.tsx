import { Button, Input, Toast } from "antd-mobile";
import {
  CalculatorOutline,
  FilterOutline,
  KeyOutline,
} from "antd-mobile-icons";
import { useLocation } from "react-router-dom";
import CryptoJS from "crypto-js";
import queryString from "query-string";
import { useRef, useState } from "react";
import S from "./index.module.scss";
import { IQueryInfo, ITablList } from "./types";

const maxCount = 1000;
const minCount = 1;

class Hash256Rand {
  private seed: Uint8Array;
  private bitSize: number;
  private digest: Uint8Array;
  private pos: number;
  private counter: bigint;

  constructor(seed: Uint8Array) {
    this.seed = new Uint8Array(seed);
    this.bitSize = 32;
    this.digest = new Uint8Array(32);
    this.pos = 0;
    this.counter = 0n;

    if (this.seed.length === 32) {
      this.digest.set(this.seed);
    } else {
      const hash = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(this.seed));
      this.digest = wordArrayToUint8Array(hash);
    }
  }

  public uint32(): number {
    const size = this.bitSize / 8;

    if (this.pos + size > this.digest.length) {
      this.counter += 1n;

      const buffer = new Uint8Array(this.seed.length + 8);
      buffer.set(this.seed);
      new DataView(buffer.buffer, this.seed.length, 8).setBigUint64(
        0,
        this.counter,
        false,
      );

      const hash = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(buffer));
      this.digest = wordArrayToUint8Array(hash);
      this.pos = 0;
    }

    let value = 0;
    for (let i = 0; i < size; i += 1) {
      value = (value << 8) | this.digest[this.pos + i];
    }

    this.pos += size;
    return value >>> 0;
  }

  public uint32N(max: number): number {
    if (max === 0) {
      return 0;
    }

    const threshold = (-max >>> 0) % max;

    while (true) {
      const value = this.uint32();
      const product = BigInt(value) * BigInt(max);

      if (Number(product & 0xffffffffn) < threshold) {
        continue;
      }

      return Number(product >> 32n);
    }
  }

  public shuffle(n: number, k: number, swap: (i: number, j: number) => void) {
    if (k <= 0) {
      return;
    }

    const count = k > n ? n : k;
    for (let i = 0; i < count; i += 1) {
      const j = i + this.uint32N(n - i);
      swap(i, j);
    }
  }
}

function wordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray): Uint8Array {
  const len = wordArray.sigBytes;
  const u8array = new Uint8Array(len);
  const words = wordArray.words;

  for (let i = 0; i < len; i += 1) {
    u8array[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }

  return u8array;
}

function createCardSequenceFromHash(hash: string, salt: string): number[] {
  const hashBytes = new TextEncoder().encode(hash);
  const saltBytes = new TextEncoder().encode(salt);
  const hmacHash = CryptoJS.HmacSHA256(
    CryptoJS.lib.WordArray.create(hashBytes),
    CryptoJS.lib.WordArray.create(saltBytes),
  );
  const seed = wordArrayToUint8Array(hmacHash);
  const rng = new Hash256Rand(seed);
  const cardSeqs = Array.from({ length: 52 * 8 }, (_, index) => index % 52);

  // Keep this aligned with the Go implementation shown by the user:
  // initialize 52*8 cards, shuffle only the first 2 positions, then return them.
  rng.shuffle(cardSeqs.length, 2, (i, j) => {
    [cardSeqs[i], cardSeqs[j]] = [cardSeqs[j], cardSeqs[i]];
  });

  return cardSeqs.slice(0, 2);
}

export default function DragonTigerPage() {
  const location = useLocation();
  const queryInfo = queryString.parse(location.search);
  const { gameHash, preAmount, app } = queryInfo as unknown as IQueryInfo;
  const initialHash = typeof gameHash === "string" ? gameHash : "";
  const initialAmount = typeof preAmount === "string" ? preAmount : "10";
  const initialAppName = typeof app === "string" ? app : "gosh";
  const [hashContent, setHashContent] = useState<string>(initialHash);
  const [saltContent, setSaltContent] = useState(
    "0000000000000000000301e2801a9a9598bfb114e574a91a887f2132f33047e6",
  );
  const [amount, setAmount] = useState<string>(initialAmount);
  const [appName] = useState<string>(initialAppName);
  const isVerifying = useRef(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [tableList, setTableList] = useState<ITablList[]>([]);

  const formatResult = (result: number[]) => `[${result.join(" ")}]`;

  const getTableList = (): Promise<ITablList[]> => {
    return new Promise((resolve, reject) => {
      try {
        let prevHash: string | null = null;
        const midArray: ITablList[] = [];
        for (let i = 0; i < Number(amount); i += 1) {
          const hash: string = prevHash
            ? String(CryptoJS.SHA256(prevHash))
            : hashContent;
          const result = createCardSequenceFromHash(hash, saltContent);
          midArray.push({ hash, result: formatResult(result) });
          prevHash = hash;
        }
        resolve(midArray);
      } catch (error) {
        reject([]);
      }
    });
  };

  const verifyList = async () => {
    try {
      if (
        !/^[1-9]\d*$/.test(amount) ||
        Number(amount) < minCount ||
        Number(amount) > maxCount
      ) {
        Toast.show(
          `Please enter a positive integer between ${minCount}-${maxCount}`,
        );
        return;
      }
      if (isVerifying.current) return;
      isVerifying.current = true;
      setButtonLoading(true);
      setTableList([]);
      const midArray = await getTableList();
      setTableList(midArray);
      setTimeout(() => {
        setButtonLoading(false);
      }, 500);
      isVerifying.current = false;
    } catch (error) {}
  };

  return (
    <div className={S.container}>
      <div className={S.containerTitle}>
        Dragon Tiger - Game Verification Script
      </div>
      <div className={S.containerSubTitle}>
        Third party script used to verify games on Dragon Tiger.
      </div>
      <div className={S.break}></div>
      <div className={S.description}>
        The following sites have purchased a non-distributable copy of the
        previous version of {appName} game&apos;s source code, exempting them
        from the requirements of the AGPL:
        <p>
          <a href={`https://${appName}.com/`}>{`https://${appName}.com/`}</a>
        </p>
      </div>
      <div className={S.break}></div>
      <div className={S.description}>
        We made the decision to update Dragon Tiger using a salted hash as
        requested by our players in order to provide the most randomized and
        fair results possible after Bet
        <span className={S.extraSpan}># 2561902</span>. For further details,
        please visit
        <p>
          <a href={`https://${appName}.com/`}>{`https://${appName}.com/`}</a>
        </p>
        We made the decision to update Dragon Tiger using a salted hash as
        requested by our players in order to provide the most randomized and
        fair results possible after Bet
        <span className={S.extraSpan}># 5282960</span>. For further details,
        please visit
        <p>
          <a href={`https://${appName}.com/`}>{`https://${appName}.com/`}</a>
        </p>
      </div>
      <div className={S.break}></div>
      <div className={S.row}>
        <div className={S.title}>Game&apos;s hash</div>
        <div className={S.inputContainer}>
          <Input
            placeholder="please input hash"
            value={hashContent}
            onChange={(val) => {
              setHashContent(val);
            }}
          />
          <KeyOutline className={S.inputIcon} />
        </div>
      </div>
      <div className={S.row}>
        <div className={S.title}>Salt</div>
        <div className={S.inputContainer}>
          <Input
            placeholder="please input slat"
            readOnly
            value={saltContent}
            onChange={(val) => {
              setSaltContent(val);
            }}
          />
          <FilterOutline className={S.inputIcon} />
        </div>
      </div>
      <div className={S.row}>
        <div className={S.title}>Amount of games</div>
        <div className={S.inputContainer}>
          <Input
            placeholder="please input amount of games"
            type="number"
            step={1}
            value={amount}
            onChange={(val) => {
              setAmount(val);
            }}
          />
          <CalculatorOutline className={S.inputIcon} />
        </div>
      </div>
      <div className={S.row}>
        <Button
          color="success"
          loading={buttonLoading}
          onClick={verifyList}
          className={S.verifyButton}
        >
          Verify
        </Button>
      </div>
      <div className={S.break}></div>
      <div className={S.tableList}>
        <div className={S.tableRow}>
          <div className={`${S.tableTitle} ${S.tableTitleBold}`}>
            Game&apos;s hash
          </div>
          <div className={`${S.tableContent} ${S.tableTitleBold}`}>Result</div>
        </div>
        <div className={S.tableContentContainer}>
          {tableList.map((data) => (
            <div key={data.hash} className={S.tableRow}>
              <div className={S.tableTitle}>{data.hash}</div>
              <div className={S.tableContent}>{data.result}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
