export const Status = (props)=>{
    const [isVisible, setIsVisible] = React.useState(false);
    React.useEffect(()=>{
        const timer = setTimeout(()=>{
            setIsVisible(true);
        }, 500);
        return ()=>clearTimeout(timer);
    }, []);
    return isVisible && /*#__PURE__*/ S.React.createElement("div", {
        className: "loadingWrapper"
    }, props.icon === "error" ? /*#__PURE__*/ S.React.createElement(ErrorIcon, null) : /*#__PURE__*/ S.React.createElement(LibraryIcon, null), /*#__PURE__*/ S.React.createElement("h1", null, props.heading), /*#__PURE__*/ S.React.createElement("h3", null, props.subheading));
};
