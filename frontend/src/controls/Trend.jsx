import React from 'react'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import { FormEntry } from './Tools'
import "../fonts/Fonts.css"
import "../fonts/Fonts"
import Initial from "./Trend.js"
import Check from '../common/Check'
import { LineChart, Line, ReferenceLine, XAxis, YAxis } from 'recharts';

function Renderer({ control, size, trend }) {
    const data = control.data
    const config = trend ? trend : {}
    const full = trend ? trend.values : []
    //local length with accumulated period
    const count = Math.trunc(1000 * data.sampleLength / config.period)
    const init = Math.max(0, full.length - count)
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
    const values = full.slice(init, full.length).map(e => {
        const normal = isNormal(e.val)
        const warning = isWarning(e.val)
        return {
            del: e.del,
            val: e.val,
            nor: normal ? e.val : null,
            war: warning && !normal ? e.val : null,
            cri: !warning && !normal ? e.val : null,
        }
    })
    const backColor = data.backColored ? data.backColor : "none"
    const lineColor = data.lineColored ? data.lineColor : "none"
    const gridColor = data.gridColored ? data.gridColor : "none"
    return <svg>
        <rect width={size.width} height={size.height} fill={backColor}></rect>
        <foreignObject width={size.width} height={size.height}>
            <LineChart width={size.width} height={size.height} data={values}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis
                    hide={true}
                    type='number'
                    reversed={true}
                    dataKey="del"
                    domain={[xmin, xmax]}
                    interval="preserveStartEnd"
                    tickFormatter={() => ""} />
                <YAxis
                    hide={true}
                    domain={[ymin, ymax]}
                    tickFormatter={() => ""} />
                <Line
                    dot={false}
                    dataKey="val"
                    strokeWidth={data.lineWidth}
                    isAnimationActive={false}
                    stroke={lineColor} />)
                <Line
                    dot={false}
                    dataKey="cri"
                    strokeWidth={data.lineWidth}
                    isAnimationActive={false}
                    fill={data.criticalColor}
                    stroke={data.criticalColor} />)
                <Line
                    dot={false}
                    dataKey="war"
                    strokeWidth={data.lineWidth}
                    isAnimationActive={false}
                    fill={data.warningColor}
                    stroke={data.warningColor} />)
                <Line
                    dot={false}
                    dataKey="nor"
                    strokeWidth={data.lineWidth}
                    isAnimationActive={false}
                    fill={data.normalColor}
                    stroke={data.normalColor} />)
                <ReferenceLine y={nmin} stroke={gridColor} />
                <ReferenceLine y={nmax} stroke={gridColor} />
                <ReferenceLine y={wmin} stroke={gridColor} />
                <ReferenceLine y={wmax} stroke={gridColor} />
            </LineChart>
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
            <FormEntry label={Initial.dlabels.lineWidth}>
                <Form.Control type="number" {...fieldProps("lineWidth")} min="0" step="1" />
            </FormEntry>
            <FormEntry label={Initial.dlabels.lineColor}>
                <InputGroup>
                    <InputGroup.Checkbox checked={data.lineColored}
                        onChange={e => setProp("lineColored", e.target.checked)}
                        title={Initial.dlabels.lineColored} />
                    <Form.Control type="color" {...fieldProps("lineColor")} />
                    <Form.Control type="text" {...fieldProps("lineColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.gridColor}>
                <InputGroup>
                    <InputGroup.Checkbox checked={data.gridColored}
                        onChange={e => setProp("gridColored", e.target.checked)}
                        title={Initial.dlabels.gridColored} />
                    <Form.Control type="color" {...fieldProps("gridColor")} />
                    <Form.Control type="text" {...fieldProps("gridColor")} />
                </InputGroup>
            </FormEntry>
            <FormEntry label={Initial.dlabels.backColor}>
                <InputGroup>
                    <InputGroup.Checkbox checked={data.backColored}
                        onChange={e => setProp("backColored", e.target.checked)}
                        title={Initial.dlabels.backColored} />
                    <Form.Control type="color" {...fieldProps("backColor")} />
                    <Form.Control type="text" {...fieldProps("backColor")} />
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
