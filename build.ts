import { $ } from "bun";

const target = "open-source-cn-shanghai.cr.volces.com/open/translate:latest";

await $`docker build -t ${target} .`;
await $`docker push ${target}`;
