import { $$ } from 'n-ui-foundations';
import Tearsheet from './tearsheet';
import Link from './link';

function init () {
	const symbols = $$('a[data-symbol]');

	if (symbols.length === 0) return;

	const tearsheet = new Tearsheet();

	symbols.forEach((item) => {
		new Link(item, tearsheet);
	});
}

export default { init };
