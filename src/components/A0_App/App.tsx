import React from 'react';
import style from "./App.module.scss";
import {Header} from "../A1_Header/Header";
import {CustomAlert} from "../X_Common/CustomAlert/CustomAlert";
import {Storage} from "../B0_Storage/Storage";

export const App = () => {
  return (
    <div className={style.app}>
        <Header/>
        <CustomAlert/>
        <Storage/>
    </div>
  );
}

