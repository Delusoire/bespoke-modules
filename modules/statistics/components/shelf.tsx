import { UI } from "/modules/stdlib/src/webpack/ComponentLibrary.ts";
import { React } from "/modules/stdlib/src/expose/React.ts";

interface ShelfProps {
	title: string;
	children: React.ReactElement | React.ReactElement[];
}

const Shelf = ({ title, children }: ShelfProps): React.ReactElement => (
	<section className="main-shelf-shelf Shelf">
		<div className="main-shelf-header">
			<div className="main-shelf-topRow">
				<div className="main-shelf-titleWrapper">
					<UI.Type as="h2" variant="canon" semanticColor="textBase">
						{title}
					</UI.Type>
				</div>
			</div>
		</div>
		<section>{children}</section>
	</section>
);

export default React.memo(Shelf);
