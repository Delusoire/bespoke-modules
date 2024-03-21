import { categories, selectedCategoryCtx } from "../../app.js";

import { S } from "/modules/Delusoire/stdlib/index.js";
import { TopNavBar } from "/modules/Delusoire/stdlib/lib/components/MountedNavBar.js";

const { React } = S;

interface PageContainerProps {
	title: string;
	headerLeft?: React.ReactNode;
	headerRight?: React.ReactNode;
	children: React.ReactNode;
}

const PageContainer = (props: PageContainerProps) => {
	const { title, headerLeft, headerRight, children } = props;
	const { TextComponent } = S.ReactComponents;
	const selectedCategory = React.useContext(selectedCategoryCtx);
	return (
		<section className="contentSpacing">
			<div className={"page-header"}>
				<div className="header-left">
					<TextComponent as="h1" variant="canon" semanticColor="textBase">
						{title}
					</TextComponent>
					{headerLeft}
					<TopNavBar categories={categories} selectedCategory={selectedCategory} />
				</div>
				<div className="header-right">{headerRight}</div>
			</div>
			<div className={"page-content"}>{children}</div>
		</section>
	);
};

export default PageContainer;
