export interface Idea {
	id: string;
	content: string;
	category: string; // 分区/分类
	createdAt: Date;
	updatedAt?: Date;
	tags?: string[]; // 可选标签
}

export interface IdeaFormData {
	content: string;
	category: string;
	tags?: string[];
}





