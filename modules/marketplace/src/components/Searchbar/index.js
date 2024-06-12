import { React } from "/modules/official/stdlib/src/expose/React.js";
export const Searchbar = (props)=>{
    return /*#__PURE__*/ React.createElement("div", {
        className: "flex flex-col flex-grow items-end"
    }, /*#__PURE__*/ React.createElement("input", {
        className: "!bg-[var(--backdrop)] border-[var(--spice-sidebar)] !text-[var(--spice-text)] border-solid h-8 py-2 px-3 rounded-lg",
        type: "text",
        placeholder: props.placeholder,
        value: props.value,
        onChange: (event)=>{
            props.onChange(event.target.value);
        }
    }));
};
export const useSearchbar = (placeholder)=>{
    const [value, setValue] = React.useState("");
    const searchbar = /*#__PURE__*/ React.createElement(Searchbar, {
        value: value,
        onChange: (str)=>{
            setValue(str);
        },
        placeholder: placeholder
    });
    return [
        searchbar,
        value
    ];
};
