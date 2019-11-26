const { parseAllDocuments } = require("yaml");
const { execSync } = require("child_process");
const { compareLists } = require("compare-lists");
const addLabels = require("./addLabelsFromFile")

const extractWhitelist = yaml => {
  const ingress = parseAllDocuments(yaml)
    .map(doc => doc.toJSON())
    .find(obj => obj.kind === "Ingress");

  const {
    metadata: {
      annotations: {
        "nginx.ingress.kubernetes.io/whitelist-source-range": whitelistString = ""
      }
    }
  } = ingress;

  return whitelistString.split(",").filter(string => string.trim() != "");
};

const execute = ({ command, cwd }) => {
  return extractWhitelist(
    execSync(command, {
      encoding: "utf8",
      cwd
    })
  );
};

const getDiffs = ({ previous, next, ipFormatter = ip => ip }) => {
  const existing = execute(previous).sort();
  const newies = execute(next).sort();

  const {
    missingInLeft: addedAddresses,
    missingInRight: removedAddresses,
    matches: matchedAddresses
  } = compareLists({
    left: existing,
    right: newies,
    compare: (left, right) => left.localeCompare(right),
    returnReport: true
  });

  const removed = removedAddresses.map(ipFormatter);
  const added = addedAddresses.map(ipFormatter);
  const matched = matchedAddresses.map(([ip, _]) => ip).map(ipFormatter);

  return { removed, added, matched };
};

console.log(
  getDiffs({
    ipFormatter: addLabels("../service/helm_deploy/values-ips.yml"),
    previous: {
      command: "helm --tiller-namespace service-preprod get service"
    },
    next: {
      cwd: "../service/helm_deploy/",
      command:
        "helm template service --values=values-prod.yaml --values=secrets-example.yaml --values=values-ips.yml"
    }
  })
);
