import {observer} from "mobx-react-lite";
import {Button} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useStore} from "../../store/useStore";
import style from "./Storage.module.scss";
import {useFormik} from "formik";
import TextField from "@mui/material/TextField";
import {FormikHelpers} from "formik/dist/types";
import {getDate} from "../../helpers/helpers";
import {IEvent, IValues} from "../../types/types";
import Typography from "@mui/material/Typography";
import {getContract, getContractAddress, getProvider} from "../../helpers/ethers.helper";

export const Storage = observer(() => {
    const {
        cryptoStore: {
            value, setValue, currentAccountAddress
        },
        appStore: {
            errorHandler
        }
    } = useStore();

    const [events, setEvents] = useState<IEvent[]>([]);

    //========= GET VALUE =========//
    const getValue = async () => {
        try {
            if (window.ethereum) {
                const provider = getProvider();
                const contract = getContract(provider);
                const value = await contract.getValue();
                setValue(value.toString());
            }
        } catch (e: any) {
            errorHandler(e);
        }
    }

    //========= GET EVENTS =========//
    const getEventsHandler = async () => {
        try {
            if (window.ethereum) {
                const provider = getProvider();
                const contract = getContract(provider);
                const filter = contract.filters.ValueChanged();
                const logs = await contract.queryFilter(filter);
                //console.log(logs);
                setEvents(logs.map(({args}) => (args ? {
                    oldValue: args[0].toString(),
                    newValue: args[1].toString(),
                    timestamp: getDate(args[2].toNumber()),
                    address: args[3],
                } : {
                    oldValue: "-",
                    newValue: "-",
                    timestamp: "-",
                    address: "-",
                })))
            }
        } catch (e: any) {
            errorHandler(e)
        }
    }

    //========= ADD EVENT LISTENERS =========
    const addListener = async () => {
        try {
            if (window.ethereum) {
                const provider = getProvider();
                const contract = getContract(provider);
                const startBlockNumber = await provider.getBlockNumber();
                contract.on("ValueChanged", async (...args) => {
                    try {
                        console.log("ValueChanged")
                        const event = args[args.length - 1];
                        if (event.blockNumber > startBlockNumber) {
                            await getEventsHandler();
                        }
                    } catch (e: any) {
                        errorHandler(e)
                    }
                })
            }
        } catch (e: any) {
            errorHandler(e)
        }
    }

    //========= МОНТИРОВАНИЕ =========//
    useEffect(() => {
        addListener().then(); // добавляем обработчик события
        getValue().then(() => {
        }); // получаем значение value
        getEventsHandler().then(() => {
        }); // получаем логи событий
    }, [window.ethereum]);

    //========= SET VALUE =========//
    const [valueChanging, setValueChanging] = useState(false);
    const initialValues: IValues = {
        value: 0
    }
    const onSubmit = async (values: IValues, formikHelpers: FormikHelpers<IValues>) => {
        try {
            if (currentAccountAddress && window.ethereum) {
                setValueChanging(true);
                const provider = getProvider();
                const signer = provider.getSigner(currentAccountAddress);
                const contract = getContract(provider);
                const tx = await contract
                    .connect(signer)
                    .setValue(values.value); // посылаем транзакцию на изменение value
                await tx.wait(); // ждем ее завершения
                const value = await contract.getValue(); // снова запрашиваем value
                setValue(value.toString()); // устанавливаем новое значение value
            }
        } catch (e: any) {
            errorHandler(e);
        } finally {
            formikHelpers.resetForm();
            setValueChanging(false);
        }
    }
    const formik = useFormik({
        initialValues,
        onSubmit: onSubmit
    })

    return (
        <div className={style.storage}>
            <div className={style.contract}>
                <h2>Storage contract</h2>

                <div className={style.addressBlock}>
                    <Typography className={style.label}>Contract address</Typography>
                    <Typography className={style.address}>{getContractAddress()}</Typography>
                </div>

                <div className={style.valueWrapper}>
                    <p className={style.label}>Value:</p>
                    <p className={style.value}>
                        <span>{value}</span>{valueChanging && <span>...value changing...</span>}
                    </p>
                </div>

                <form onSubmit={formik.handleSubmit}
                      className={style.form}
                >
                    <TextField fullWidth
                               size="small"
                               label="Value"
                               type="number"
                               inputProps={{
                                   min: 0
                               }}
                               {...formik.getFieldProps('value')}
                               disabled={!window.ethereum || !currentAccountAddress || valueChanging}
                    />
                    <Button type="submit"
                            variant="contained"
                            fullWidth
                            className={style.btn}
                            disabled={!window.ethereum || !currentAccountAddress || valueChanging}
                    >
                        set value
                    </Button>
                </form>
            </div>

            <div className={style.events}>
                <h2>Event ValueChanged</h2>

                <div className={style.table}>
                    <div className={style.header}>
                        <p>oldValue</p>
                        <p>newValue</p>
                        <p>timestamp</p>
                        <p>address</p>
                    </div>

                    <div className={style.rows}>
                        {
                            events.map(({oldValue, newValue, timestamp, address}, key) => (
                                <div className={style.row} key={key}>
                                    <p>{oldValue}</p>
                                    <p>{newValue}</p>
                                    <p>{timestamp}</p>
                                    <p>{address}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>


            </div>


        </div>
    )
})
