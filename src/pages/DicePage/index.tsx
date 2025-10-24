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
import { IDiceResult, IQueryInfo } from "./types";
import { picList } from "./const";

const maxCount = 1000;
const minCount = 1;

export default function DiceVerifyPage() {
  const location = useLocation();
  const queryInfo = queryString.parse(location.search);
  const { gameHash, preAmount } = queryInfo as unknown as IQueryInfo;

  const [hashContent, setHashContent] = useState(gameHash ?? "");
  const [saltContent, setSaltContent] = useState(
    "0000000000000000000301e2801a9a9598bfb114e574a91a887f2132f33047e6"
  );
  const [amount, setAmount] = useState(preAmount ?? "10");

  const [tableList, setTableList] = useState<IDiceResult[]>([]);
  const [buttonLoading, setButtonLoading] = useState(false);
  const isVerifying = useRef(false);

  const diceValueFromHash = (hash: string, salt: string): IDiceResult => {
    const hmacHash = CryptoJS.HmacSHA256(hash, salt).toString(CryptoJS.enc.Hex);

    const hex1 = hmacHash.slice(0, 8);
    const dice1 = (parseInt(hex1, 16) % 6) + 1;

    const hex2 = hmacHash.slice(8, 16);
    const dice2 = (parseInt(hex2, 16) % 6) + 1;

    const hex3 = hmacHash.slice(16, 24);
    const dice3 = (parseInt(hex3, 16) % 6) + 1;

    return {
      hash,
      dice1,
      dice2,
      dice3,
      total: dice1 + dice2 + dice3,
    };
  };

  const getTableList = (): Promise<IDiceResult[]> => {
    return new Promise((resolve, reject) => {
      try {
        let prevHash: string | null = null;
        const midArray: IDiceResult[] = [];
        for (let i = 0; i < Number(amount); i++) {
          const hash: any = String(
            prevHash ? CryptoJS.SHA256(prevHash) : hashContent
          );
          const result = diceValueFromHash(hash, saltContent);
          midArray.push(result);
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

      setTimeout(() => setButtonLoading(false), 500);
      isVerifying.current = false;
    } catch (error) {
      console.error(error);
      Toast.show("Verification failed");
      setButtonLoading(false);
      isVerifying.current = false;
    }
  };

  return (
    <div className={S.container}>
      <div className={S.containerTitle}>Dice Game - Verification Script</div>
      <div className={S.containerSubTitle}>
        Third-party script used to verify fairness of Dice game results.
      </div>
      <div className={S.break}></div>
      <div className={S.description}>
        The following sites have purchased a non-distributable copy of the
        previous version of gosh game’s source code, exempting them from the
        requirements of the AGPL:
        <p>
          <a href="https://gosh.com/">https://gosh.com/</a>
        </p>
      </div>
      <div className={S.break}></div>
      <div className={S.description}>
        We made the decision to update Dice Game using a salted hash as
        requested by our players in order to provide the most randomized and
        fair results possible after Bet
        <span className={S.extraSpan}># 2561902</span>. For further details,
        please visit
        <p>
          <a href="https://gosh.com/">https://gosh.com/</a>
        </p>
        We made the decision to update Dice Game using a salted hash as
        requested by our players in order to provide the most randomized and
        fair results possible after Bet
        <span className={S.extraSpan}># 5282960</span>. For further details,
        please visit
        <p>
          <a href="https://gosh.com/">https://gosh.com/</a>
        </p>
      </div>
      <div className={S.break}></div>

      <div className={S.row}>
        <div className={S.title}>Game&apos;s hash</div>
        <div className={S.inputContainer}>
          <Input
            placeholder="please input hash"
            value={hashContent}
            onChange={(val) => setHashContent(val)}
          />
          <KeyOutline className={S.inputIcon} />
        </div>
      </div>

      <div className={S.row}>
        <div className={S.title}>Salt</div>
        <div className={S.inputContainer}>
          <Input
            placeholder="please input salt"
            readOnly
            value={saltContent}
            onChange={(val) => setSaltContent(val)}
          />
          <FilterOutline className={S.inputIcon} />
        </div>
      </div>

      <div className={S.row}>
        <div className={S.title}>Amount of games</div>
        <div className={S.inputContainer}>
          <Input
            placeholder="please input amount"
            type="number"
            step={1}
            value={amount}
            onChange={(val) => setAmount(val)}
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
            Game&apos;s Hash
          </div>
          <div className={`${S.tableContent} ${S.tableTitleBold}`}>Results</div>
        </div>

        <div className={S.tableContentContainer}>
          {tableList.map((data) => (
            <div key={data.hash} className={S.tableRow}>
              <div className={S.tableTitle}>{data.hash}</div>
              <div className={S.tableContent}>
                {!!data?.dice1 && (
                  <img
                    src={picList?.[data?.dice1] || ""}
                    className={S.tableContentImg}
                  />
                )}
                {!!data?.dice2 && (
                  <img
                    src={picList?.[data?.dice2] || ""}
                    className={S.tableContentImg}
                  />
                )}
                {!!data?.dice3 && (
                  <img
                    src={picList?.[data?.dice3] || ""}
                    className={S.tableContentImg}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
