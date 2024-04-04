// TODO: edit these keys
const def_fields = {
    text: "#ffffff",
    subtext: "#a7a7a7",
    main: "#121212",
    main_elevated: "#242424",
    highlight: "#1a1a1a",
    highlight_elevated: "#2a2a2a",
    sidebar: "#000000",
    player: "#1a1a1a",
    card: "#292929",
    shadow: "#000000",
    selected_row: "#ffffff",
    button: "#1ed760",
    button_active: "#1ed760",
    button_disabled: "#727272",
    tab_active: "#2a2a2a",
    notification: "#3d91f4",
    notification_error: "#e91429",
    misc: "#727272"
};
// store
let local_schemes = JSON.parse(localStorage.getItem("schemes") || "[]");
const static_schemes = [
    {
        name: "Spotify",
        local: false,
        fields: def_fields
    }
];
let curr_scheme = JSON.parse(localStorage.getItem("curr_scheme") || "null") || static_schemes[0];
const stylesheet = document.createElement("style");
document.head.appendChild(stylesheet);
// main
function get_schemes() {
    return [
        ...local_schemes,
        ...static_schemes
    ];
}
function get_scheme(name) {
    if (name === "def") return static_schemes[0];
    return get_schemes().find((scheme)=>scheme.name === name);
}
function from_partial(partial_scheme, provider = false) {
    return {
        name: provider ? `${partial_scheme.name} • ${provider}` : partial_scheme.name,
        local: !provider,
        fields: {
            ...def_fields,
            ...partial_scheme.fields
        }
    };
}
function stringify_scheme(scheme) {
    return Object.entries(scheme.fields).map(([name, value])=>`--spice-${name}: ${value};`).join(" ");
}
function write_scheme(scheme) {
    stylesheet.innerHTML = `.encore-dark-theme { ${stringify_scheme(scheme)} }`;
}
function toggle_scheme(name) {
    const scheme = get_scheme(name);
    curr_scheme = scheme;
    write_scheme(scheme);
    localStorage.setItem("curr_scheme", JSON.stringify(scheme));
}
// local schemes
function create_local(partial_scheme) {
    local_schemes.push(from_partial(partial_scheme));
    localStorage.setItem("schemes", JSON.stringify(local_schemes));
}
function update_local(name, new_fields) {
    const scheme = get_scheme(name);
    scheme.fields = new_fields;
    localStorage.setItem("schemes", JSON.stringify(local_schemes));
    if (curr_scheme.name === name) {
        write_scheme(scheme);
    }
}
function delete_local(name) {
    local_schemes = local_schemes.filter((scheme)=>scheme.name !== name);
    localStorage.setItem("schemes", JSON.stringify(local_schemes));
}
function rename_local(name, new_name) {
    const scheme = get_scheme(name);
    scheme.name = new_name;
    localStorage.setItem("schemes", JSON.stringify(local_schemes));
    toggle_scheme(new_name);
}
// static schemes
function create_statics(partial_schemes, provider) {
    const schemes = partial_schemes.map((scheme)=>from_partial(scheme, provider));
    static_schemes.push(...schemes);
}
write_scheme(curr_scheme);
export { curr_scheme, get_schemes, get_scheme, toggle_scheme, create_local, update_local, delete_local, rename_local, create_statics };
