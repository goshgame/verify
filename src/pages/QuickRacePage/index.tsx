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
import { IQueryInfo, ITablList, QuickRaceBetType } from "./types";

const maxCount = 1000;
const minCount = 1;

export default function QuickRacePage() {
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

  const gameResult = (hash: string, salt: string) => {
    const hmacHash = CryptoJS.HmacSHA256(hash, salt).toString(CryptoJS.enc.Hex);

    const hex = hmacHash.slice(0, 8);
    const hexNumber = parseInt(hex, 16);
    const win = Math.floor((hexNumber * 10) / 0x100000000);

    const nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let remaining = nums.filter((n) => n !== win);

    const hashBytes = Array.from(hmacHash).map((c) => c.charCodeAt(0));

    for (let i = remaining.length - 1; i > 0; i--) {
      const byteIndex = (8 + i) % hashBytes.length;
      const j = hashBytes[byteIndex] % (i + 1);
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }

    const finalRes = [win, ...remaining];

    const mapNumToType = (num: number) => {
      switch (num) {
        case 0:
          return QuickRaceBetType.QuickRaceBetType10;
        case 1:
          return QuickRaceBetType.QuickRaceBetType1;
        case 2:
          return QuickRaceBetType.QuickRaceBetType2;
        case 3:
          return QuickRaceBetType.QuickRaceBetType3;
        case 4:
          return QuickRaceBetType.QuickRaceBetType4;
        case 5:
          return QuickRaceBetType.QuickRaceBetType5;
        case 6:
          return QuickRaceBetType.QuickRaceBetType6;
        case 7:
          return QuickRaceBetType.QuickRaceBetType7;
        case 8:
          return QuickRaceBetType.QuickRaceBetType8;
        case 9:
          return QuickRaceBetType.QuickRaceBetType9;
        default:
          return QuickRaceBetType.QuickRaceBetType1;
      }
    };

    const mappedResult = finalRes.map(mapNumToType);
    return mappedResult;
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
        QuickRace - Game Verification Script
      </div>
      <div className={S.containerSubTitle}>
        Third party script used to verify games on QuickRace game.
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
        We made the decision to update QuickRace using a salted hash as
        requested by our players in order to provide the most randomized and
        fair results possible after Bet
        <span className={S.extraSpan}># 2561902</span>. For further details,
        please visit
        <p>
          <a href={`https://${appName}.com/`}>{`https://${appName}.com/`}</a>
        </p>
        We made the decision to update QuickRace using a salted hash as
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
              <div className={S.tableContent}>{data.result?.join(",")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
