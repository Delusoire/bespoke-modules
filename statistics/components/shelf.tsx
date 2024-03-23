import { S } from "/modules/Delusoire/stdlib/index.js";
const { React } = S;

interface ShelfProps {
	title: string;
	children: React.ReactElement | React.ReactElement[];
}

const Shelf = ({ title, children }: ShelfProps): React.ReactElement => (
	<section className="main-shelf-shelf Shelf">
		<div className="main-shelf-header">
			<div className="main-shelf-topRow">
				<div className="main-shelf-titleWrapper">
					<S.ReactComponents.UI.Type as="h2" variant="canon" semanticColor="textBase">
						{title}
					</S.ReactComponents.UI.Type>
				</div>
			</div>
		</div>
		<section>{children}</section>
	</section>
);

export default React.memo(Shelf);
