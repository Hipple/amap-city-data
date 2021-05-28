import axios from "axios"
import { Item } from "./type"
import { jsonAll } from "./write/json_all"
import { jsonArea } from "./write/json_area"
import { jsonCity } from "./write/json_city"
import { jsonLetterCity } from "./write/json_letter_city"
import { jsonPc } from "./write/json_pc"
import { jsonPca } from "./write/json_pca"
import { jsonProvince } from "./write/json_province"
import { jsonProvinceCity } from "./write/json_province_city"

async function main() {
  let url = "https://restapi.amap.com/v3/config/district"
  url += "?keywords=中国"
  // 仅获取到：1.省级，2.市级，3.区级
  url += "&subdistrict=3"
  url += "&extensions=base"
  url += "&key=" + "2d5e68717688cd56a40f1c7b92454dbf"

  let { data } = await axios.get(encodeURI(url))
  if (
    !data.districts ||
    data.districts.length !== 1 ||
    data.districts[0].name !== "中华人民共和国"
  )
    throw Error("数据获取失败")

  let items: Item[] = []

  for (const p of data.districts[0].districts) {
    items.push({
      code: p.adcode,
      name: p.name,
      center: p.center,
      level: "province",
      country_code: data.districts[0].adcode,
    })
    for (const c of p.districts) {
      items.push({
        code: c.adcode,
        name: c.name,
        center: c.center,
        level: "city",
        province_code: p.adcode,
      })
      for (const d of c.districts) {
        items.push({
          code: d.adcode,
          name: d.name,
          center: d.center,
          level: "area",
          province_code: p.adcode,
          city_code: c.adcode,
        })
      }
    }
  }

  /** 排除香港、台湾、澳门 */
  const exclude = ["810000", "710000", "820000"]

  items = items.filter((it) => exclude.indexOf(it.code) === -1)

  jsonProvince(items)
  jsonCity(items)
  jsonArea(items)

  jsonAll(items)
  jsonProvinceCity(items)

  jsonPc(items)
  jsonPca(items)

  jsonLetterCity(items)

  console.log("所有文件输出完毕")
}

main()
