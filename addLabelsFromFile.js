const { parse } = require("yaml");
const fs = require("fs");

/**
 * Provde a path to a Yaml file in the format:
 * ```
 * whitelist_groups:
 *  group:
 *    name: ipaddress
 * ```
 * This will produce a function which will display each ip in the format: 
 * '$ip   ($group/$name)'
 * or if not present in the file
 * '$ip   (not known/not known)'
 * 
 */
module.exports = filePath => {
  return ip => {
    const ipFile = fs.readFileSync(filePath, { encoding: "utf8" });

    const ips = Object.entries(parse(ipFile)["whitelist_groups"]).reduce(
      (acc, [group, addresses]) => [
        ...acc,
        ...Object.entries(addresses).map(([name, ipAddress]) => [
          ipAddress,
          [group, name]
        ])
      ],
      []
    );

    const [_, [group, name] = ["not known", "not known"]] =
      ips.find(([ipAddress]) => ip === ipAddress) || [];
    return `${ip.padEnd(20)} (${group}/${name})`;
  };
};
