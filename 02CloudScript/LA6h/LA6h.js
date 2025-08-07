function decodeUplink(input) {
    if (!Array.isArray(input.bytes)) {
        return { errors: ["Invalid input: bytes must be an array"] };
    }
    let bytes = input.bytes;
    let results = []; // 用于存储每条数据解析结果的数组

    function toSignedInt16(value) {
        return value > 32767 ? value - 65536 : value;
    }

    let msg_type = bytes[0];
    let payloadLength = bytes.length;

    if (msg_type <= 0x64) { // normal report
        if (bytes.length < 7) {
            return { errors: ["Invalid payload length for normal report"] };
        }
        let sensor_type = bytes[1];
        if (sensor_type == 0x66) { // LA3h
            let data = {
                report: true,
                flag: bytes[2],    // report type
                temp: toSignedInt16((bytes[3] << 8) | bytes[4]), // temp1
				hum: bytes[5]
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
            while (index + 9 <= payloadLength) {
                let sensor_type = bytes[index];
                if (sensor_type == 0x66) { // LA3h history data
                    let data = {
                        report_history: true,
                        measure_utc_time: (bytes[index + 1] << 24) | (bytes[index + 2] << 16) | (bytes[index + 3] << 8) | bytes[index + 4],
                        flag: bytes[index + 5],
                        temp: toSignedInt16((bytes[index + 6] << 8) | bytes[index + 7]),
						hum: bytes[index + 8]
                    };
                    results.push(data);
                    index += 9;
                }
            }
        }
    }
    return { data: results };
}