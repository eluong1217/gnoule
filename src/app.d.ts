declare global {
	namespace App {
		interface Platform {
			env: {
				MEDIA_KV: KVNamespace;
			};
		}
	}
}
export {};