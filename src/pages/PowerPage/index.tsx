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
import {
  IQueryInfo,
  ITablList,
  probabilitys,
  GenCardPowerResult,
  probabilitysStr,
} from "./types";

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

const codes = [
  "armcar",
  "banana",
  "bank",
  "bell",
  "boat",
  "car",
  "cem",
  "cherry",
  "chest",
  "coin",
  "crown",
  "glasses",
  "gold",
  "heart",
  "hoe",
  "joker",
  "key",
  "lemon",
  "lightn",
  "money",
  "moon",
  "muffin",
  "necklace",
  "orange",
  "pear",
  "pearl",
  "piggybank",
  "pineapl",
  "rinbow",
  "ring",
  "safe",
  "scale",
  "shoe",
  "star",
  "strawberry",
  "sun",
  "tophat",
  "tree",
  "trophy",
  "vault",
];

export default function PowerPage() {
  const location = useLocation();
  const queryInfo = queryString.parse(location.search);
  const { serverSeed, clientSeed, app, nonce } =
    queryInfo as unknown as IQueryInfo;
  const [serverSeedInput, setServerSeedInput] = useState(
    serverSeed ??
      "8b2aec7b56b2ccaa3b155fd828cdde20c296b950166e36403e245197228b383fe36e8a307d5be4a180ce451f4f36da0a8a9f90c6e265c25f0846c94b92d99bdd"
  );
  const [clientSeedInput, setClientSeedInput] = useState(
    clientSeed ??
      "b14c3232d0e6531577e56df518c6188d584e17ae6dca5e0ea0ea4598f560c8a0"
  );
  const [nonceCount, setNonceCount] = useState(nonce ?? "10");
  const [appName, setAppName] = useState(app ?? "gosh");
  const isVerifying = useRef(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [tableList, setTableList] = useState<ITablList[]>([]);

  const gameResult = (
    serverSeed: string,
    clientSeed: string,
    nonce: number
  ): GenCardPowerResult => {
    return genCardPower(serverSeed, clientSeed, nonce, 25);
  };

  const bytesToFloat = (bytes: Uint8Array): number => {
    if (bytes.length < 4) return 0;
    let val = 0;
    for (let i = 0; i < 4; i++) {
      val = (val << 8) | (bytes[i] & 0xff);
    }
    val = val >>> 0;
    return val / 0x100000000;
  };

  const deriveDice = (
    serverSeed: string,
    clientSeed: string,
    nonce: number
  ): [number, number, number, number] => {
    const msg = `${clientSeed}:${nonce}`;
    const hmac = CryptoJS.HmacSHA512(msg, serverSeed);

    const digest = new Uint8Array(64);
    const words = hmac.words;
    for (let i = 0; i < 64; i++) {
      digest[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }

    const X0 = bytesToFloat(digest.slice(0, 4));
    const X1 = bytesToFloat(digest.slice(4, 8));
    const X2 = bytesToFloat(digest.slice(8, 12));
    const X3 = bytesToFloat(digest.slice(12, 16));

    return [X0, X1, X2, X3];
  };

  const selectAward = (X0: number, probabilities: number[]): number => {
    let cumulative = 0.0;
    for (let i = 0; i < probabilities.length; i++) {
      cumulative += probabilities[i];
      if (X0 < cumulative) return i;
    }
    return -1;
  };

  const deterministicShuffle = (hashRaw: string, slice: string[]): string[] => {
    const encoder = new TextEncoder();
    const hashBytes = encoder.encode(hashRaw);
    const r = new Hash256Rand(hashBytes);

    r.Shuffle(slice.length, slice.length, (i, j) => {
      const tmp = slice[i];
      slice[i] = slice[j];
      slice[j] = tmp;
    });

    return slice;
  };

  const genCardPower = (
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    gridLen: number
  ): GenCardPowerResult => {
    const codesCopy = [...codes];

    const shuffleSeed = serverSeed + clientSeed + String(nonce);

    deterministicShuffle(shuffleSeed, codesCopy);

    const [X0, X1] = deriveDice(serverSeed, clientSeed, nonce);

    const awardIndex = selectAward(X0 * 100, probabilitys);

    let result = "";
    if (awardIndex >= 0) {
      const index = Math.floor(X1 * gridLen);
      // result = codesCopy[index];
      result = probabilitysStr[awardIndex];
      codesCopy[index] = result;
    }

    return {
      number: result,
      codes: codesCopy,
    };
  };

  const getTableList = (): Promise<ITablList[]> => {
    return new Promise((resolve, reject) => {
      try {
        const midArray: ITablList[] = [];
        // for (let i = 0; i < Number(nonceCount); i++) {
        //   const nonce = i + 1;
        //   const result = gameResult(serverSeedInput, clientSeedInput, nonce);
        //   midArray.push({ nonce, result });
        // }
        // const nonce = i + 1;
        const result = gameResult(
          serverSeedInput,
          clientSeedInput,
          Number(nonceCount)
        );
        midArray.push({ nonce: Number(nonceCount), result });
        resolve(midArray);
      } catch (error) {
        reject([]);
      }
    });
  };
  const verifyList = async () => {
    try {
      if (!/^[1-9]\d*$/.test(nonceCount)) {
        Toast.show(`Please enter a positive integer `);
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
      <div className={S.containerTitle}>Power - Game Verification Script</div>
      <div className={S.containerSubTitle}>
        Third party script used to verify Power game results.
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
        We made the decision to update Power using a salted hash as requested by
        our players in order to provide the most randomized and fair results
        possible after Bet
        <span className={S.extraSpan}># 2561902</span>. For further details,
        please visit
        <p>
          <a href={`https://${appName}.com/`}>{`https://${appName}.com/`}</a>
        </p>
        We made the decision to update Power using a salted hash as requested by
        our players in order to provide the most randomized and fair results
        possible after Bet
        <span className={S.extraSpan}># 5282960</span>. For further details,
        please visit
        <p>
          <a href={`https://${appName}.com/`}>{`https://${appName}.com/`}</a>
        </p>
      </div>
      <div className={S.break}></div>
      <div className={S.row}>
        <div className={S.title}>Server Seed</div>
        <div className={S.inputContainer}>
          <Input
            placeholder="please input server seed"
            value={serverSeedInput}
            onChange={(val) => {
              setServerSeedInput(val);
            }}
          />
          <KeyOutline className={S.inputIcon} />
        </div>
      </div>
      <div className={S.row}>
        <div className={S.title}>Client Seed</div>
        <div className={S.inputContainer}>
          <Input
            placeholder="please input client seed"
            value={clientSeedInput}
            onChange={(val) => {
              setClientSeedInput(val);
            }}
          />
          <FilterOutline className={S.inputIcon} />
        </div>
      </div>
      <div className={S.row}>
        <div className={S.title}>Nonce count</div>

        <div className={S.inputContainer}>
          <Input
            placeholder="please input Nonce count"
            type="number"
            step={1}
            value={nonceCount}
            onChange={(val) => {
              setNonceCount(val);
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
          <div className={`${S.tableTitle} ${S.tableTitleBold}`}>Nonce</div>
          <div className={`${S.tableContent} ${S.tableTitleBold}`}>Number</div>
          <div className={`${S.tableContent} ${S.tableTitleBold}`}>Codes</div>
        </div>
        <div className={S.tableContentContainer}>
          {tableList.map((data) => (
            <div key={data.nonce} className={S.tableRow}>
              <div className={S.tableTitle}>{data.nonce}</div>
              <div className={S.tableContent}>{data.result.number}</div>
              <div className={S.tableContent}>
                {data.result.codes?.join(",")}
              </div>
              {/* <div className={S.tableContent}>
                {data.result.bottom?.join(",")}
              </div> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
