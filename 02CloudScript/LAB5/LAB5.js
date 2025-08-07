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

   
	let sensor_type = bytes[0];
	if (sensor_type == 0x69) { // LAB5
		let data = {
			report: true,
			utc_time: bytes[1] << 24 | bytes[2] << 16 | bytes[3] << 8 | bytes[4],    // utc timer
			button_type: bytes[5], // trigger type
			batter_per: bytes[6]  // batter
		};
		results.push(data);
	}
    
	else if (msg_type == 0xFF) { // join success status report
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
    
    return { data: results };
}