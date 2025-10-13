/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from "fs";
import * as path from "path";


type Trnasport = {
  name: string;
}
export default class TransportRegistry {
	static transports: { [key: string]: Trnasport } = {};

	registerTransport(adapter: any): void {
		TransportRegistry.transports[adapter.name] = adapter;
	}
	async loadTransports(): Promise<void> {
		const adaptersDir = path.resolve(__dirname, "../transports");
		const dirs = fs.readdirSync(adaptersDir);

		for (const dir of dirs) {
			try {
        const file = fs
			.readdirSync(adaptersDir + "/" + dir)
			.find((f: string) => f === "instance.ts");
				if (file) {
					const module = require(path.join(
						`${adaptersDir}/${dir}`,
						file
					));
					if (!module?.default)
						throw new Error("No default export found");

					this.registerTransport(module.default);

					if (typeof module.default.boot !== "function") {
						throw new Error(
							`[Transport Registry] Transport ${module.default.name} does not have a boot method`
						);
					}

					module.default.boot();
					console.log(
						`[Transport Registry] Loaded transport: ${module.default.name}`
					);
				}
			} catch (err: any) {
				console.error(
					`[Adapter Registry] Failed to load adapter from ${dir}:`,
					err.message
				);
			}
		}
	}
}

