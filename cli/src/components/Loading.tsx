import React from 'react';
import { render, Text } from 'ink';
import Spinner from 'ink-spinner';

interface Props {
	text?: string
}

export default function Loading ({text=' Loading'}:Props) {
	return (
		<Text>
			<Text color="green">
				<Spinner type="dots" />
			</Text>
			{text}
		</Text>
	);
}
