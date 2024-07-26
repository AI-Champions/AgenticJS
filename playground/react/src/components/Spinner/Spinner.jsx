import "./spinner.css";

export default function Spinner({ color = "primary" }) {
    let css;

    if (color === "primary") {
        css = "spinner";
    }

    if (color === "white") {
        css = "spinnerWhite";
    }

    return <div className={`${css}`}></div>;
}
