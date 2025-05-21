const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");

const parser = new xml2js.Parser({ explicitArray: false });
const inputRoot = "./types"; // 原始 XML 根目录
const outputRoot = "./output"; // 输出 JSON 根目录

const main = async () => {
  const xmlFiles = findAllXmlFiles(inputRoot);
  console.log("找到的 XML 文件：", xmlFiles);

  for (const filePath of xmlFiles) {
    try {
      const json = await parseXmlFile(filePath);
      for (const type of json.types.type) {
        if (!type.value) continue;
        if (type.value instanceof Array) {
          //多个value
        } else {
          //单个value
        }
      }
      console.log(`转换 ${filePath} 成功`);

      // 获取相对路径并构造输出路径
      const relativePath = path.relative(inputRoot, filePath);
      const outputPath = path
        .join(outputRoot, relativePath)
        .replace(/\.xml$/i, ".json");

      // 确保输出目录存在
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });

      // 保存 JSON 文件
      fs.writeFileSync(outputPath, JSON.stringify(json, null, 2), "utf-8");
      console.log(`已保存为 ${outputPath}`);
    } catch (err) {
      console.error(`解析 ${filePath} 出错:`, err);
    }
  }
};

/**
 * 读取并解析 XML 文件为 JSON
 * @param {string} filePath XML 文件路径
 * @returns {Promise<Object>} 解析后的 JSON 对象
 */
function parseXmlFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) return reject(err);
      parser.parseString(data, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  });
}

/**
 * 递归遍历文件夹，查找所有 .xml 文件
 * @param {string} dir 起始目录
 * @param {string[]} xmlFiles 用于存储找到的 XML 文件路径
 * @returns {string[]} 所有找到的 XML 文件路径
 */
function findAllXmlFiles(dir, xmlFiles = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      findAllXmlFiles(fullPath, xmlFiles);
    } else if (
      entry.isFile() &&
      path.extname(entry.name).toLowerCase() === ".xml"
    ) {
      xmlFiles.push(fullPath);
    }
  }

  return xmlFiles;
}

main();
