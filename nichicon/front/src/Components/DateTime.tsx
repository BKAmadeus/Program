import DatePicker, { registerLocale } from "react-datepicker";
import ja from 'date-fns/locale/ja';
import { Fragment } from 'react';
import getMonth from 'date-fns/getMonth'
import getYear from 'date-fns/getYear'
import _ from 'lodash'
import '../style.css';

const years = _.range(getYear(new Date()), getYear(new Date()) + 10, 1)
const months = Array.from(Array(12).keys())

export const DateTime = (DT:any) => {
    const initialDate = new Date()
    registerLocale('ja', ja);
    const handleStartChange = (date:Date) => {
        DT.setDate((prevState:any) => ({...prevState,start:date}));
    }
    const handleEndChange = (date:Date) => {
        DT.setDate((prevState:any) => ({...prevState,end:date}));
    }

    return (
        <Fragment>
            <div className="datetimeclender">
                <DatePicker
                    showTimeSelect
                    withPortal
                    selected={DT.start}
                    startDate={DT.start}
                    endDate={DT.end}
                    timeFormat="p"
                    timeIntervals={15}
                    dateFormat="Pp"
                    locale='ja'
                    minDate={initialDate}
                    onChange={handleStartChange}
                    renderCustomHeader={({
                        date,
                        changeYear,
                        changeMonth,
                        decreaseMonth,
                        increaseMonth,
                        prevMonthButtonDisabled,
                        nextMonthButtonDisabled
                    }) => (
                        <div>
                        <button
                            onClick={decreaseMonth}
                            disabled={prevMonthButtonDisabled}
                        >
                            前月へ移動
                        </button>
                        <select
                            value={getYear(date)}
                            onChange={({ target: { value } }) => changeYear(value)}
                        >
                            {years.map((option) => (
                            <option key={option} value={option}>
                                {option}年
                            </option>
                            ))}
                        </select>
                        <select
                            value={getMonth(date)}
                            onChange={({ target: { value } }) => changeMonth(value)}
                        >
                            {months.map((option) => (
                            <option key={option} value={option}>
                                {option + 1}月
                            </option>
                            ))}
                        </select>
                        <button
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}
                        >
                            次月へ移動
                        </button>
                        </div>
                    )}
                />
                ~
                <DatePicker
                    showTimeSelect
                    withPortal
                    selected={DT.end}
                    startDate={DT.start}
                    endDate={DT.end}
                    timeFormat="p"
                    timeIntervals={15}
                    dateFormat="Pp"
                    locale='ja'
                    minDate={DT.start}
                    onChange={handleEndChange}
                    renderCustomHeader={({
                        date,
                        changeYear,
                        changeMonth,
                        decreaseMonth,
                        increaseMonth,
                        prevMonthButtonDisabled,
                        nextMonthButtonDisabled
                    }) => (
                        <div>
                        <button
                            onClick={decreaseMonth}
                            disabled={prevMonthButtonDisabled}
                        >
                            前月へ移動
                        </button>
                        <select
                            value={getYear(date)}
                            onChange={({ target: { value } }) => changeYear(value)}
                        >
                            {years.map((option) => (
                            <option key={option} value={option}>
                                {option}年
                            </option>
                            ))}
                        </select>
                        <select
                            value={getMonth(date)}
                            onChange={({ target: { value } }) => changeMonth(value)}
                        >
                            {months.map((option) => (
                            <option key={option} value={option}>
                                {option + 1}月
                            </option>
                            ))}
                        </select>
                        <button
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}
                        >
                            次月へ移動
                        </button>
                        </div>
                    )}
                />
            </div>
        </Fragment>
    )
  }