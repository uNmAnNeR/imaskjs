export default
function el () {
	const stub = {
		value: "",
		selectionStart: 0,
		selectionEnd: 0,
		setSelectionRange: (start, end) => {
			stub.selectionStart = start;
			stub.selectionEnd = end;
		},
		addEventListener: () => {},
		removeEventListener: () => {}
	};
	return stub;
}
