import { categories, selectedCategoryCtx } from "../../app.js";
import CreatePlaylistButton, { type CreatePlaylistButtonProps } from "../buttons/create_playlist_button.js";

import { S } from "/modules/Delusoire/stdlib/index.js";
import { TopNavBar } from "/modules/Delusoire/stdlib/lib/components/MountedNavBar.js";

const { React } = S;

interface PageContainerProps {
	title: string;
	createPlaylistButtonProps?: CreatePlaylistButtonProps;
	headerEls?: React.ReactElement | React.ReactElement[];
	children: React.ReactElement | React.ReactElement[];
}

const PageContainer = (props: PageContainerProps) => {
	const { title, createPlaylistButtonProps, headerEls, children } = props;
	const { TextComponent } = S.ReactComponents;
	const selectedCategory = React.useContext(selectedCategoryCtx);
	return (
		<section className="contentSpacing">
			<div className={"page-header"}>
				<div className="header-left">
					<TextComponent as="h1" variant="canon" semanticColor="textBase">
						{title}
					</TextComponent>
					{createPlaylistButtonProps && <CreatePlaylistButton {...createPlaylistButtonProps} />}
					<TopNavBar categories={categories} selectedCategory={selectedCategory} />
				</div>
				<div className="header-right">{headerEls}</div>
			</div>
			<div className={"page-content"}>{children}</div>
		</section>
	);
};

export default PageContainer;
