import {NetWorthIncrementData} from "../../AnalysisModel";
import {Col, Row, Typography} from "antd";
import React from "react";
import {ResponsiveLine} from "@nivo/line";

export function Graphs(props: {
    data: NetWorthIncrementData
}) {
    return <Row justify="center">
        <Col md={12} sm={24}>
            <Typography.Title level={5} className="title-color">
                Crecimiento Patrimonial
            </Typography.Title>
            <div style={{height: 300}}>
                <NetWorthIncrement data={data}/>
            </div>
        </Col>
        <Col md={12} sm={24}>
            <Typography.Title level={5} className="title-color">
                Crecimiento salarial
            </Typography.Title>
            <div style={{height: 300}}>
                <NetWorthIncrement data={data2}/>
            </div>
        </Col>
    </Row>
}


export function NetWorthIncrement(props: { data: any }) {

    return <ResponsiveLine
        data={props.data}
        margin={{top: 50, right: 110, bottom: 50, left: 60}}
        xScale={{type: 'point'}}
        yScale={{type: 'linear', min: 'auto', max: 'auto', stacked: true, reverse: false}}
        yFormat=" >-.2f"
        axisTop={null}
        axisRight={null}
        axisBottom={{
            orient: 'bottom',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'transportation',
            legendOffset: 36,
            legendPosition: 'middle'
        }}
        axisLeft={{
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'count',
            legendOffset: -40,
            legendPosition: 'middle'
        }}
        pointSize={10}
        pointColor={{theme: 'background'}}
        pointBorderWidth={2}
        pointBorderColor={{from: 'serieColor'}}
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
            {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1
                        }
                    }
                ]
            }
        ]}
    />;
}

const data = [{
    "id": "japan",
    "color": "hsl(55, 70%, 50%)",
    "data": [
        {
            "x": "plane",
            "y": 279
        },
        {
            "x": "helicopter",
            "y": 34
        },
        {
            "x": "boat",
            "y": 73
        },
        {
            "x": "train",
            "y": 171
        },
        {
            "x": "subway",
            "y": 158
        },
        {
            "x": "bus",
            "y": 178
        },
        {
            "x": "car",
            "y": 215
        },
        {
            "x": "moto",
            "y": 154
        },
        {
            "x": "bicycle",
            "y": 168
        },
        {
            "x": "horse",
            "y": 40
        },
        {
            "x": "skateboard",
            "y": 219
        },
        {
            "x": "others",
            "y": 185
        }
    ]
},
    {
        "id": "france",
        "color": "hsl(82, 70%, 50%)",
        "data": [
            {
                "x": "plane",
                "y": 33
            },
            {
                "x": "helicopter",
                "y": 43
            },
            {
                "x": "boat",
                "y": 275
            },
            {
                "x": "train",
                "y": 196
            },
            {
                "x": "subway",
                "y": 38
            },
            {
                "x": "bus",
                "y": 3
            },
            {
                "x": "car",
                "y": 131
            },
            {
                "x": "moto",
                "y": 36
            },
            {
                "x": "bicycle",
                "y": 162
            },
            {
                "x": "horse",
                "y": 226
            },
            {
                "x": "skateboard",
                "y": 43
            },
            {
                "x": "others",
                "y": 25
            }
        ]
    },
    {
        "id": "us",
        "color": "hsl(307, 70%, 50%)",
        "data": [
            {
                "x": "plane",
                "y": 38
            },
            {
                "x": "helicopter",
                "y": 236
            },
            {
                "x": "boat",
                "y": 40
            },
            {
                "x": "train",
                "y": 33
            },
            {
                "x": "subway",
                "y": 206
            },
            {
                "x": "bus",
                "y": 214
            },
            {
                "x": "car",
                "y": 222
            },
            {
                "x": "moto",
                "y": 276
            },
            {
                "x": "bicycle",
                "y": 40
            },
            {
                "x": "horse",
                "y": 141
            },
            {
                "x": "skateboard",
                "y": 96
            },
            {
                "x": "others",
                "y": 17
            }
        ]
    },
    {
        "id": "germany",
        "color": "hsl(1, 70%, 50%)",
        "data": [
            {
                "x": "plane",
                "y": 106
            },
            {
                "x": "helicopter",
                "y": 239
            },
            {
                "x": "boat",
                "y": 186
            },
            {
                "x": "train",
                "y": 290
            },
            {
                "x": "subway",
                "y": 66
            },
            {
                "x": "bus",
                "y": 106
            },
            {
                "x": "car",
                "y": 213
            },
            {
                "x": "moto",
                "y": 212
            },
            {
                "x": "bicycle",
                "y": 37
            },
            {
                "x": "horse",
                "y": 220
            },
            {
                "x": "skateboard",
                "y": 189
            },
            {
                "x": "others",
                "y": 55
            }
        ]
    },
    {
        "id": "norway",
        "color": "hsl(260, 70%, 50%)",
        "data": [
            {
                "x": "plane",
                "y": 1
            },
            {
                "x": "helicopter",
                "y": 216
            },
            {
                "x": "boat",
                "y": 293
            },
            {
                "x": "train",
                "y": 162
            },
            {
                "x": "subway",
                "y": 188
            },
            {
                "x": "bus",
                "y": 87
            },
            {
                "x": "car",
                "y": 228
            },
            {
                "x": "moto",
                "y": 265
            },
            {
                "x": "bicycle",
                "y": 4
            },
            {
                "x": "horse",
                "y": 2
            },
            {
                "x": "skateboard",
                "y": 144
            },
            {
                "x": "others",
                "y": 170
            }
        ]
    }];


const data2 = [{
    "id": "japan",
    "color": "hsl(285, 70%, 50%)",
    "data": [
        {
            "x": "plane",
            "y": 100
        },
        {
            "x": "helicopter",
            "y": 4
        },
        {
            "x": "boat",
            "y": 9
        },
        {
            "x": "train",
            "y": 240
        },
        {
            "x": "subway",
            "y": 261
        },
        {
            "x": "bus",
            "y": 142
        },
        {
            "x": "car",
            "y": 60
        },
        {
            "x": "moto",
            "y": 243
        },
        {
            "x": "bicycle",
            "y": 277
        },
        {
            "x": "horse",
            "y": 116
        },
        {
            "x": "skateboard",
            "y": 192
        },
        {
            "x": "others",
            "y": 233
        }
    ]
},
    {
        "id": "france",
        "color": "hsl(259, 70%, 50%)",
        "data": [
            {
                "x": "plane",
                "y": 147
            },
            {
                "x": "helicopter",
                "y": 41
            },
            {
                "x": "boat",
                "y": 252
            },
            {
                "x": "train",
                "y": 259
            },
            {
                "x": "subway",
                "y": 181
            },
            {
                "x": "bus",
                "y": 158
            },
            {
                "x": "car",
                "y": 291
            },
            {
                "x": "moto",
                "y": 94
            },
            {
                "x": "bicycle",
                "y": 84
            },
            {
                "x": "horse",
                "y": 178
            },
            {
                "x": "skateboard",
                "y": 127
            },
            {
                "x": "others",
                "y": 169
            }
        ]
    },
    {
        "id": "us",
        "color": "hsl(157, 70%, 50%)",
        "data": [
            {
                "x": "plane",
                "y": 179
            },
            {
                "x": "helicopter",
                "y": 64
            },
            {
                "x": "boat",
                "y": 170
            },
            {
                "x": "train",
                "y": 148
            },
            {
                "x": "subway",
                "y": 140
            },
            {
                "x": "bus",
                "y": 122
            },
            {
                "x": "car",
                "y": 74
            },
            {
                "x": "moto",
                "y": 282
            },
            {
                "x": "bicycle",
                "y": 144
            },
            {
                "x": "horse",
                "y": 28
            },
            {
                "x": "skateboard",
                "y": 25
            },
            {
                "x": "others",
                "y": 56
            }
        ]
    },
    {
        "id": "germany",
        "color": "hsl(177, 70%, 50%)",
        "data": [
            {
                "x": "plane",
                "y": 248
            },
            {
                "x": "helicopter",
                "y": 48
            },
            {
                "x": "boat",
                "y": 134
            },
            {
                "x": "train",
                "y": 190
            },
            {
                "x": "subway",
                "y": 89
            },
            {
                "x": "bus",
                "y": 185
            },
            {
                "x": "car",
                "y": 184
            },
            {
                "x": "moto",
                "y": 240
            },
            {
                "x": "bicycle",
                "y": 49
            },
            {
                "x": "horse",
                "y": 170
            },
            {
                "x": "skateboard",
                "y": 64
            },
            {
                "x": "others",
                "y": 202
            }
        ]
    },
    {
        "id": "norway",
        "color": "hsl(110, 70%, 50%)",
        "data": [
            {
                "x": "plane",
                "y": 154
            },
            {
                "x": "helicopter",
                "y": 220
            },
            {
                "x": "boat",
                "y": 296
            },
            {
                "x": "train",
                "y": 28
            },
            {
                "x": "subway",
                "y": 157
            },
            {
                "x": "bus",
                "y": 182
            },
            {
                "x": "car",
                "y": 153
            },
            {
                "x": "moto",
                "y": 79
            },
            {
                "x": "bicycle",
                "y": 10
            },
            {
                "x": "horse",
                "y": 300
            },
            {
                "x": "skateboard",
                "y": 280
            },
            {
                "x": "others",
                "y": 129
            }
        ]
    }
]
