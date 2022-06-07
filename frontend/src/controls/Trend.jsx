import React from 'react'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import { FormEntry } from './Tools'
import "../fonts/Fonts.css"
import "../fonts/Fonts"
import Initial from "./Trend.js"
import Check from '../common/Check'
import { CartesianGrid, ScatterChart, Scatter, XAxis, YAxis } from 'recharts';

function Renderer({ control, size, trend }) {
    const data = control.data
    const config = trend ? trend : {}
    const full = trend ? trend.values : []
    //local length with accumulated period
    const count = Math.trunc(1000 * data.sampleLength / config.period)
    const init = Math.max(0, full.length - count)
    const values = full.slice(init, full.length)
    const xmin = Number(data.samplePeriod)
    const xmax = 0
    const ymin = Number(data.inputMin)
    const ymax = Number(data.inputMax)
    const nmin = Number(data.normalMin)
    const nmax = Number(data.normalMax)
    const wmin = Number(data.warningMin)
    const wmax = Number(data.warningMax)
    const isNormal = (v) => v >= nmin && v <= nmax
    const isWarning = (v) => v >= wmin && v <= wmax
    const normal = values.filter(e => isNormal(e.val))
    const warning = values.filter(e => isWarning(e.val) && !isNormal(e.val))
    const critical = values.filter(e => !isWarning(e.val) && !isNormal(e.val))
    return <svg>
        <foreignObject width={size.width} height={size.height}>
            <ScatterChart width={size.width} height={size.height}>
                <XAxis
                    type='number'
                    reversed={true}
                    dataKey="del"
                    domain={[xmin, xmax]}
                    interval="preserveStartEnd"
                    tickFormatter={() => ""} />
                <YAxis
                    dataKey="val"
                    domain={[ymin, ymax]}
                    tickFormatter={() => ""} />
                <Scatter line shape="cross"
                    isAnimationActive={false}
                    data={normal}
                    fill={data.normalColor} />)
                <Scatter line shape="cross"
                    isAnimationActive={false}
                    data={warning}
                    fill={data.warningColor} />)
                <Scatter line shape="cross"
                    isAnimationActive={false}
                    data={critical}
                    fill={data.criticalColor} />)
                <CartesianGrid strokeDasharray="1 1" />
            </ScatterChart>
        </foreignObject>
    </svg>
}

function Editor({ control, setProp, globals }) {
    const captured = globals.captured
    const setCaptured = globals.setCaptured
    const data = control.data
    function fieldProps(prop) {
        function setter(name) {
            return function (value) {
                setProp(name, value)
            }
        }
        const args = { captured, setCaptured }
        args.label = Initial.dlabels[prop]
        args.hint = Initial.dhints[prop]
        args.getter = () => data[prop]
        args.setter = setter(prop)
        args.check = Initial.dchecks[prop]
        args.defval = Initial.data()[prop]
        return Check.props(args)
    }

    return (
        <>
            <FormEntry label={Initial.dlabels.sample}>
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("samplePeriod")} min="1" />
                    <Form.Control type="number" {...fieldProps("sampleLength")} min="1" />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.inputRange}>
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("inputMin")} />
                    <Form.Control type="number" {...fieldProps("inputMax")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.normalRange}>
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("normalMin")} />
                    <Form.Control type="number" {...fieldProps("normalMax")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.warningRange}>
                <InputGroup>
                    <Form.Control type="number" {...fieldProps("warningMin")} />
                    <Form.Control type="number" {...fieldProps("warningMax")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.criticalColor}>
                <InputGroup>
                    <Form.Control type="color" {...fieldProps("criticalColor")} />
                    <Form.Control type="text" {...fieldProps("criticalColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.warningColor}>
                <InputGroup>
                    <Form.Control type="color" {...fieldProps("warningColor")} />
                    <Form.Control type="text" {...fieldProps("warningColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.normalColor}>
                <InputGroup>
                    <Form.Control type="color" {...fieldProps("normalColor")} />
                    <Form.Control type="text" {...fieldProps("normalColor")} />
                </InputGroup>
            </FormEntry>
        </>
    )
}

const Type = Initial.type
const Init = Initial.data
const Merge = Initial.merge

const Label = { Type, Init, Editor, Renderer, Merge }

export default Label
