import { _ } from "/modules/official/stdlib/deps.ts";
import { React } from "/modules/official/stdlib/src/expose/React.ts";

export interface SearchbarProps {
	value: string;
	onChange: (value: string) => void,
	placeholder: string;
}
export const Searchbar = (props: SearchbarProps) => {
	return (
		<div className="flex flex-col flex-grow items-end">
			<input
				className="!bg-[var(--backdrop)] border-[var(--spice-sidebar)] !text-[var(--spice-text)] border-solid h-8 py-2 px-3 rounded-lg"
				type="text"
				placeholder={props.placeholder}
				value={props.value}
				onChange={event => {
					props.onChange(event.target.value);
				}}
			/>
		</div>
	);
};

export const useSearchbar = (placeholder: string) => {
	const [value, setValue] = React.useState("");

	const searchbar = (
		<Searchbar
			value={value}
			onChange={str => {
				setValue(str);
			}}
			placeholder={placeholder}
		/>
	);

	return [searchbar, value] as const;
};
