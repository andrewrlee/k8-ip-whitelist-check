=== A tool to display differences between two sets of kubernetes nginx ip whitelists

For instance to compare ip whitelists before and after a deploy when using helm:

```js
console.log(
  getDiffs({
    ipFormatter: addLabelsFromFile("../service/helm_deploy/values-ips.yml"),
    previous: {
      command: "helm --tiller-namespace service-preprod get service"
    },
    next: {
      cwd: "../service/helm_deploy/",
      command:
        "helm template service --values=values-prod.yaml --values=secrets-example.yaml --values=values-ips.yml"
    }
  })
)
```

Would produce something like: 

```js
{ removed:
   [ '111.22.33.44/32      (not known/not known)',
     '111.22.33.46/32      (Group1/host5)'
  added:
   [ '111.22.33.40/32      (Group1/host1)',
     '111.22.33.41/32      (Group2/host2)',
     '111.22.33.42/32      (not known/not known)'
  matched:
   [ '111.22.33.47/32      (Group1/host3)',
     '111.22.33.48/32      (Group2/host1)',
     '111.22.33.49/32      (Group3/host1)'] }
```

`ipFormatter` is an optional parameter which allows decorating an ip address. 
The provided impl `addLabelsFromFile` will decorate the ip address with labels extracted from a file in the structure of: 

```yaml
whitelist_groups:
  Group1:
    host1: 111.22.33.40/32
    host3: 111.22.33.47/32
    host5: 111.22.33.46/32
  Group2:
    host1: 111.22.33.48/32
    host2: 111.22.33.41/32
  Group3:
    host1: 111.22.33.49/32
```