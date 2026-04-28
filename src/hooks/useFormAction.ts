import { useTransition } from "react";

export function useFormAction<T extends (...args: any[]) => Promise<any>>(
	action: T,
	onSuccess?: (result: Awaited<ReturnType<T>>) => void,
) {
	const [isPending, startTransition] = useTransition();

	const execute = (...args: Parameters<T>) => {
		startTransition(async () => {
			const result = await action(...args);
			onSuccess?.(result);
		});
	};

	return { execute, isPending };
}
