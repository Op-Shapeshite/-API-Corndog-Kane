import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
	schema: path.join("prisma", "base.prisma"),
	migrations: {
		path: path.join("src", "adapters", "postgres", "migrations"),
	},
	typedSql: {
		path: path.join("src",'adapters','postgres', "queries"),
	},
});
