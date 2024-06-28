declare module "react" {
	interface InputHTMLAttributes<T> {
		webkitdirectory?: string;
		directory?: string;
	}
}

export type SceneType = {
	id: number;
	name: string;
	normalized_name: string;
	no_of_rec: number;
};
