export default function s3Loader({ src }: { src: string }) {
	const S3_IMAGES_URL =
		"https://megascenes.s3.us-west-2.amazonaws.com/images";
	return `${S3_IMAGES_URL}/${src}`;
}
