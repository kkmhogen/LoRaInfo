function decodeUplink(input) {
    if (!Array.isArray(input.bytes)) {
        return { errors: ["Invalid input: bytes must be an array"] };
    }
    let bytes = input.bytes;
    let results = []; // 用于存储每条数据解析结果的数组

    function int32ToFloat(bytes) {
        const buffer = new ArrayBuffer(4);
        const view = new DataView(buffer);
        view.setUint8(0, bytes[0]);
        view.setUint8(1, bytes[1]);
        view.setUint8(2, bytes[2]);
        view.setUint8(3, bytes[3]);
        return view.getFloat32(0);
    }

    let msg_type = bytes[0];
    let payloadLength = bytes.length;

    if (msg_type < 0x00 || msg_type > 0xFF) {
        return { errors: ["Invalid message type"] };
    }

    if (msg_type <= 0x64) { // normal report
        if (bytes.length < 11) {
            return { errors: ["Invalid payload length for normal report"] };
        }
        let sensor_type = bytes[1];
        if (sensor_type == 0x67) { // LA3G
            let data = {
                report: true,
                flag: bytes[2],    // report type
                lat: int32ToFloat([bytes[3], bytes[4], bytes[5], bytes[6]]),
                log: int32ToFloat([bytes[7], bytes[8], bytes[9], bytes[10]]),
            };
            results.push(data);
        }
    }
    else { // history report or join success status report
        if (msg_type == 0xFF) { // join success status report
            if (bytes.length < 6) {
                return { errors: ["Invalid payload length for join success report"] };
            }
            let data = {
                join_success: true,
                model: bytes[1],
                battery: (bytes[2] << 8) | bytes[3],
                soft_version: (bytes[4] << 8) | bytes[5]
            };
            results.push(data);
        }
        else {
            let index = 0;
            while (index + 14 < payloadLength) {
                let sensor_type = bytes[index];
                if (sensor_type == 0x67) { // LA3g history data
                    let data = {
                        report_history: true,
                        measure_utc_time: (bytes[index + 1] << 24) | (bytes[index + 2] << 16) | (bytes[index + 3] << 8) | bytes[index + 4],
                        flag: bytes[index + 5],
                        lat_data: int32ToFloat([bytes[index + 6], bytes[index + 7], bytes[index + 8], bytes[index + 9]]),
                        log_data: int32ToFloat([bytes[index + 10], bytes[index + 11], bytes[index + 12], bytes[index + 13]]),
                    };
                    results.push(data);
                    index += 14;
                } 
            }
        }
    }
    return { data: results };
}
