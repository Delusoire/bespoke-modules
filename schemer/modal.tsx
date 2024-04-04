import { S, SVGIcons } from "/modules/Delusoire/stdlib/index.js";

import { useSearchBar } from "/modules/Delusoire/stdlib/lib/components/index.js";
import * as sm from "./schemes.js";
import { createIconComponent } from "../stdlib/lib/createIconComponent.js";

function isValidHex(hex: string) {
	const regex = /^#[0-9A-Fa-f]{6}$/;
	return regex.test(hex);
}

const SchemerModal = () => {
	const [modal_scheme, set_modal_scheme] = S.React.useState(sm.curr_scheme);
	const [schemes, set_schemes] = S.React.useState(sm.get_schemes());
	const [searchbar, search] = useSearchBar({ placeholder: "Search Schemes", expanded: true });

	function set_scheme(scheme) {
		set_modal_scheme(scheme);
		sm.toggle_scheme(scheme.name);
	}

	function update_field(name, value) {
		const new_fields = { ...modal_scheme.fields, [name]: value };
		set_modal_scheme({ ...modal_scheme, fields: new_fields });

		if (!isValidHex(value)) return;
		sm.update_local(modal_scheme.name, new_fields);
	}

	function add_scheme() {
		sm.create_local({ name: "New Custom", fields: modal_scheme.fields });
		set_schemes(sm.get_schemes());

		set_scheme(sm.get_scheme("New Custom"));
	}

	function rem_scheme(scheme) {
		sm.delete_local(scheme.name);
		set_schemes(sm.get_schemes());
		set_scheme(sm.get_scheme("def"));
	}

	function rename_scheme(scheme, new_name) {
		sm.rename_local(scheme.name, new_name);
		set_schemes(sm.get_schemes());
	}

	function copy_obj() {
		const css = JSON.stringify(modal_scheme);
		S.Platform.getClipboardAPI().copy(css);
	}

	const LocalInfo = () => {
		const [name, set_name] = S.React.useState(modal_scheme.name);

		return (
			<div className="scheme-info">
				<input
					className="scheme-name"
					readOnly={!modal_scheme.local}
					placeholder="Custom Scheme"
					value={modal_scheme.local ? name : `${name} (static)`}
					onChange={e => set_name(e.target.value)}
				/>
				{modal_scheme.local && [
					<button onClick={() => rem_scheme(modal_scheme)}>Delete</button>,
					<button onClick={e => rename_scheme(modal_scheme, name)}>Rename</button>,
				]}
				<button onClick={copy_obj}>Copy Object</button>
			</div>
		);
	};

	const filtered_schemes = schemes.filter(scheme => scheme.name.toLowerCase().includes(search.toLowerCase()));

	return (
		<div className="schemer-container">
			<div className="scheme-list-container">
				<ul>
					{searchbar}
					<S.ReactComponents.MenuItem
						leadingIcon={createIconComponent({
							icon: SVGIcons.plus2px,
						})}
						divider="after"
						onClick={add_scheme}
					>
						Create New Local
					</S.ReactComponents.MenuItem>
					<ul className="scheme-list">
						{filtered_schemes.map(scheme => (
							<S.ReactComponents.MenuItem onClick={() => set_scheme(scheme)}>{scheme.name}</S.ReactComponents.MenuItem>
						))}
					</ul>
				</ul>
			</div>
			<div className="splitter" />
			<div className="scheme-fields-container">
				<LocalInfo />
				<div className="scheme-fields">
					{Object.entries(modal_scheme.fields).map(([name, value]) => (
						<div className="input-row">
							<label>{name}</label>
							<input className="color-input" type="color" value={value} onChange={e => update_field(name, e.target.value)} />
							<input className="text-input" type="text" value={value} onChange={e => update_field(name, e.target.value)} />
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default SchemerModal;
