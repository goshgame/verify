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
      this.digest = this.wordArrayToUint8Array(hash);
    }
  }

  private wordArrayToUint8Array(wordArray: any): Uint8Array {
    const len = wordArray.sigBytes;
    const u8array = new Uint8Array(len);
    const words = wordArray.words;

    for (let i = 0; i < len; i++) {
      u8array[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }

    return u8array;
  }

  public Uint32(): number {
    const n = this.bitSize / 8;

    if (this.pos + n > this.digest.length) {
      this.counter++;

      const b = new Uint8Array(this.seed.length + 8);
      b.set(this.seed);

      const counterView = new DataView(b.buffer, this.seed.length, 8);
      counterView.setBigUint64(0, this.counter, false);

      const hash = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(b));
      this.digest = this.wordArrayToUint8Array(hash);
      this.pos = 0;
    }

    let v = 0;
    for (let i = 0; i < n; i++) {
      v = (v << 8) | this.digest[this.pos + i];
    }

    this.pos += n;
    return v >>> 0;
  }

  public Uint32N(n: number): number {
    if (n === 0) {
      return 0;
    }

    // 计算threshold：-n mod n
    const threshold = (-n >>> 0) % n;

    while (true) {
      const x = this.Uint32();
      const prod = BigInt(x) * BigInt(n);
      const prodLow = Number(prod & 0xffffffffn);

      if (prodLow < threshold) {
        continue;
      }

      return Number(prod >> 32n);
    }
  }

  public Shuffle(
    n: number,
    k: number,
    swap: (i: number, j: number) => void
  ): void {
    if (k <= 0 || n <= 0) return;
    if (k > n) k = n;

    for (let i = 0; i < k; i++) {
      const j = i + this.Uint32N(n - i);
      swap(i, j);
    }
  }
}

export default function TeenPattiPage() {
  const location = useLocation();
  const queryInfo = queryString.parse(location.search);
  const { gameHash, preAmount, app } = queryInfo as unknown as IQueryInfo;
  const [hashContent, setHashContent] = useState(gameHash ?? "");
  const [saltContent, setSaltContent] = useState(
    "0000000000000000000301e2801a9a9598bfb114e574a91a887f2132f33047e6"
  );
  const [amount, setAmount] = useState(preAmount ?? "10");
  const [appName, setAppName] = useState(app ?? "gosh");
  const isVerifying = useRef(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [tableList, setTableList] = useState<ITablList[]>([]);

  const gameResult = (hash: string, salt: string): number[] => {
    const result = cardSeqValueFromHash(hash, salt);
    return result;
  };

  const cardSeqValueFromHash = (hash: string, salt: string): number[] => {
    const hashBytes = new TextEncoder().encode(hash);
    const saltBytes = new TextEncoder().encode(salt);

    const hmacHash = CryptoJS.HmacSHA256(
      CryptoJS.lib.WordArray.create(hashBytes),
      CryptoJS.lib.WordArray.create(saltBytes)
    );

    const seed = new Uint8Array(32);
    const words = hmacHash.words;
    for (let i = 0; i < 32; i++) {
      seed[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }

    const rng = new Hash256Rand(seed);

    let cardSeqs: number[] = Array.from({ length: 52 }, (_, index) => index);

    rng.Shuffle(cardSeqs.length, 9, (i: number, j: number) => {
      const temp = cardSeqs[i];
      cardSeqs[i] = cardSeqs[j];
      cardSeqs[j] = temp;
    });

    return cardSeqs.slice(0, 9);
  };

  const numberToCard = (num: number): string => {
    const cardMap: string[] = [
      "♦2",
      "♣2",
      "♥2",
      "♠2", // 2
      "♦3",
      "♣3",
      "♥3",
      "♠3", // 3
      "♦4",
      "♣4",
      "♥4",
      "♠4", // 4
      "♦5",
      "♣5",
      "♥5",
      "♠5", // 5
      "♦6",
      "♣6",
      "♥6",
      "♠6", // 6
      "♦7",
      "♣7",
      "♥7",
      "♠7", // 7
      "♦8",
      "♣8",
      "♥8",
      "♠8", // 8
      "♦9",
      "♣9",
      "♥9",
      "♠9", // 9
      "♦10",
      "♣10",
      "♥10",
      "♠10", // 10
      "♦J",
      "♣J",
      "♥J",
      "♠J", // J
      "♦Q",
      "♣Q",
      "♥Q",
      "♠Q", // Q
      "♦K",
      "♣K",
      "♥K",
      "♠K", // K
      "♦A",
      "♣A",
      "♥A",
      "♠A", // A
    ];
    return cardMap[num] || String(num);
  };

  const getTableList = (): Promise<ITablList[]> => {
    return new Promise((resolve, reject) => {
      try {
        let prevHash = null;
        const midArray = [];
        for (let i = 0; i < Number(amount); i++) {
          let hash: any = String(
            prevHash ? CryptoJS.SHA256(String(prevHash)) : hashContent
          );
          const result = gameResult(hash, saltContent);
          midArray.push({ hash, result });
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
          `Please enter a positive integer between ${minCount}-${maxCount}`
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
        TeenPatti - Game Verification Script
      </div>
      <div className={S.containerSubTitle}>
        Third party script used to verify games on TeenPatti game.
      </div>
      <div className={S.break}></div>
      <div className={S.description}>
        The following sites have purchased a non-distributable copy of the
        previous version of {appName} game’s source code, exempting them from
        the requirements of the AGPL:
        <p>
          <a href={`https://${appName}.com/`}>{`https://${appName}.com/`}</a>
        </p>
      </div>
      <div className={S.break}></div>
      <div className={S.description}>
        We made the decision to update TeenPatti using a salted hash as
        requested by our players in order to provide the most randomized and
        fair results possible after Bet
        <span className={S.extraSpan}># 2561902</span>. For further details,
        please visit
        <p>
          <a href={`https://${appName}.com/`}>{`https://${appName}.com/`}</a>
        </p>
        We made the decision to update TeenPatti using a salted hash as
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
          <div className={`${S.tableContent}  ${S.tableTitleBold}`}>Result</div>
        </div>
        <div className={S.tableContentContainer}>
          {tableList.map((data) => (
            <div key={data.hash} className={S.tableRow}>
              <div className={S.tableTitle}>{data.hash}</div>
              <div className={S.tableContent}>
                {data.result.map(numberToCard).join(", ")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
