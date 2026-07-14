import { Button, Input, Toast } from "antd-mobile";
import {
  CalculatorOutline,
  FilterOutline,
  KeyOutline,
} from "antd-mobile-icons";
import CryptoJS from "crypto-js";
import queryString from "query-string";
import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import S from "./index.module.scss";
import { IQueryInfo, ITablList } from "./types";

const maxCount = 1000;
const minCount = 1;
const defaultSalt =
  "0000000000000000000301e2801a9a9598bfb114e574a91a887f2132f33047e6";

const lightningCounts = [
  { count: 1, weight: 40 },
  { count: 2, weight: 30 },
  { count: 3, weight: 20 },
  { count: 4, weight: 8 },
  { count: 5, weight: 2 },
];

const lightningMultipliers = [
  { multiplier: 5000, weight: 60 },
  { multiplier: 10000, weight: 25 },
  { multiplier: 15000, weight: 10 },
  { multiplier: 20000, weight: 4 },
  { multiplier: 50000, weight: 1 },
];

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

  private wordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray): Uint8Array {
    const len = wordArray?.sigBytes;
    const u8array = new Uint8Array(len);
    const words = wordArray?.words;

    for (let i = 0; i < len; i++) {
      u8array[i] = (words?.[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
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
      v = (v << 8) | this.digest?.[this.pos + i];
    }

    this.pos += n;
    return v >>> 0;
  }

  public Uint32N(n: number): number {
    if (n === 0) {
      return 0;
    }

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

const hexToBytes = (hex: string) => {
  const bytes = new Uint8Array(hex?.length / 2);

  for (let i = 0; i < bytes?.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }

  return bytes;
};

const pickWeighted = <T extends { weight: number }>(
  rng: Hash256Rand,
  items: T[]
): T => {
  const total = items?.reduce((sum, item) => sum + item?.weight, 0);
  const pick = rng.Uint32N(total) + 1;
  let current = 0;

  for (const item of items) {
    current += item?.weight;
    if (pick <= current) {
      return item;
    }
  }

  return items?.[items?.length - 1];
};

const getRouletteResult = (hash: string, salt: string) => {
  const seed = CryptoJS.HmacSHA256(hash, salt).toString(CryptoJS.enc.Hex);
  const rng = new Hash256Rand(hexToBytes(seed));
  const winNumber = rng.Uint32N(37);
  const count = pickWeighted(rng, lightningCounts)?.count;
  const numbers = Array.from({ length: 37 }, (_, index) => index);

  rng.Shuffle(numbers?.length, count, (i: number, j: number) => {
    const current = numbers?.[i];
    numbers[i] = numbers?.[j];
    numbers[j] = current;
  });

  const lightningNumbers = numbers?.slice(0, count);
  lightningNumbers?.forEach(() => {
    pickWeighted(rng, lightningMultipliers);
  });

  return winNumber;
};

export default function RoulettePage() {
  const location = useLocation();
  const queryInfo = queryString.parse(location?.search);
  const { gameHash, preAmount, salt, app } =
    queryInfo as unknown as IQueryInfo;
  const [hashContent, setHashContent] = useState(gameHash ?? "");
  const [saltContent, setSaltContent] = useState(salt ?? defaultSalt);
  const [amount, setAmount] = useState(preAmount ?? "10");
  const [appName] = useState(app ?? "gosh");
  const isVerifying = useRef(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [tableList, setTableList] = useState<ITablList[]>([]);

  const getTableList = (): Promise<ITablList[]> => {
    return new Promise((resolve, reject) => {
      try {
        let prevHash = "";
        const midArray: ITablList[] = [];

        for (let i = 0; i < Number(amount); i++) {
          const hash = String(
            prevHash ? CryptoJS.SHA256(String(prevHash)) : hashContent
          );
          const result = getRouletteResult(hash, saltContent);

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
      if (!hashContent) {
        Toast.show("Please enter game's hash");
        return;
      }

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

      if (isVerifying?.current) return;
      isVerifying.current = true;
      setButtonLoading(true);
      setTableList([]);
      const midArray = await getTableList();
      setTableList(midArray);
      setTimeout(() => {
        setButtonLoading(false);
      }, 500);
      isVerifying.current = false;
    } catch (error) {
      isVerifying.current = false;
      setButtonLoading(false);
    }
  };

  return (
    <div className={S?.container}>
      <div className={S?.containerTitle}>Roulette - Game Verification Script</div>
      <div className={S?.containerSubTitle}>
        Third party script used to verify games on Lightning Roulette game.
      </div>
      <div className={S?.break}></div>
      <div className={S?.description}>
        The following sites have purchased a non-distributable copy of the
        previous version of {appName} game&apos;s source code, exempting them
        from the requirements of the AGPL:
        <p>
          <a href={`https://${appName}.com/`}>{`https://${appName}.com/`}</a>
        </p>
      </div>
      <div className={S?.break}></div>
      <div className={S?.description}>
        This verifier calculates seed with HMAC-SHA256 using salt as the key and
        game hash as the message, then uses Hash256Rand to draw the winning
        number.
      </div>
      <div className={S?.break}></div>
      <div className={S?.row}>
        <div className={S?.title}>Game&apos;s hash</div>
        <div className={S?.inputContainer}>
          <Input
            placeholder="please input hash"
            value={hashContent}
            onChange={(val) => {
              setHashContent(val);
            }}
          />
          <KeyOutline className={S?.inputIcon} />
        </div>
      </div>
      <div className={S?.row}>
        <div className={S?.title}>Salt</div>
        <div className={S?.inputContainer}>
          <Input
            placeholder="please input salt"
            value={saltContent}
            onChange={(val) => {
              setSaltContent(val);
            }}
          />
          <FilterOutline className={S?.inputIcon} />
        </div>
      </div>
      <div className={S?.row}>
        <div className={S?.title}>Amount of games</div>
        <div className={S?.inputContainer}>
          <Input
            placeholder="please input amount of games"
            type="number"
            step={1}
            value={amount}
            onChange={(val) => {
              setAmount(val);
            }}
          />
          <CalculatorOutline className={S?.inputIcon} />
        </div>
      </div>
      <div className={S?.row}>
        <Button
          color="success"
          loading={buttonLoading}
          onClick={verifyList}
          className={S?.verifyButton}
        >
          Verify
        </Button>
      </div>
      <div className={S?.break}></div>
      <div className={S?.tableList}>
        <div className={S?.tableRow}>
          <div className={`${S?.tableTitle} ${S?.tableTitleBold}`}>
            Game&apos;s hash
          </div>
          <div className={`${S?.tableContent} ${S?.tableTitleBold}`}>
            Result
          </div>
        </div>
        <div className={S?.tableContentContainer}>
          {tableList?.map((data) => (
            <div key={data?.hash} className={S?.tableRow}>
              <div className={S?.tableTitle}>{data?.hash}</div>
              <div className={S?.tableContent}>{data?.result}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
