const EARTH_RADIUS = 6378137;   // 赤道半径(单位m)
export class LocationUtil {
    /**
     * 根据经纬度计算地理距离
     * @param {object} loc1 A点经纬度{longitude, latitude}
     * @param {object} loc2 B点经纬度{longitude, latitude}
     * @returns {number} 返回的距离，单位m 
     */
    static getGeographicalDistance(loc1, loc2) {
        let radLat1 = this.getRad(loc1.latitude);
        let radLon1 = this.getRad(loc1.longitude);

        let radLat2 = this.getRad(loc2.latitude);
        let radLon2 = this.getRad(loc2.longitude);

        if (radLat1 < 0) {
            radLat1 = Math.PI / 2 + Math.abs(radLat1);  // south  
        }
        if (radLat1 > 0) {
            radLat1 = Math.PI / 2 - Math.abs(radLat1);  // north  
        }
        if (radLon1 < 0) {
            radLon1 = Math.PI * 2 - Math.abs(radLon1);  // west  
        }

        if (radLat2 < 0) {
            radLat2 = Math.PI / 2 + Math.abs(radLat2);  // south  
        }
        if (radLat2 > 0) {
            radLat2 = Math.PI / 2 - Math.abs(radLat2);  // north  
        }
        if (radLon2 < 0) {
            radLon2 = Math.PI * 2 - Math.abs(radLon2);  // west  
        }

        let x1 = EARTH_RADIUS * Math.cos(radLon1) * Math.sin(radLat1);
        let y1 = EARTH_RADIUS * Math.sin(radLon1) * Math.sin(radLat1);
        let z1 = EARTH_RADIUS * Math.cos(radLat1);

        let x2 = EARTH_RADIUS * Math.cos(radLon2) * Math.sin(radLat2);
        let y2 = EARTH_RADIUS * Math.sin(radLon2) * Math.sin(radLat2);
        let z2 = EARTH_RADIUS * Math.cos(radLat2);

        let d = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) + (z1 - z2) * (z1 - z2));
        //余弦定理求夹角  
        let theta = Math.acos((EARTH_RADIUS * EARTH_RADIUS + EARTH_RADIUS * EARTH_RADIUS - d * d) / (2 * EARTH_RADIUS * EARTH_RADIUS));
        let dist = theta * EARTH_RADIUS;
        return dist;
    }

    /** 
     * 转化为弧度(rad) 
     * */
    static getRad(d) {
        return d * Math.PI / 180;
    }
}