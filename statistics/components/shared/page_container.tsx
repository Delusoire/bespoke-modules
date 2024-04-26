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

const PageContainer = ({ title, headerLeft, headerRight, children }: PageContainerProps) => {
	const selectedCategory = React.useContext(selectedCategoryCtx);
	return (
		<section className="contentSpacing">
			<div className={"page-header"}>
				<div className="header-left">
					<S.ReactComponents.UI.Type as="h1" variant="canon" semanticColor="textBase">
						{title}
					</S.ReactComponents.UI.Type>
					{headerLeft}
					<TopNavBar categories={categories} selectedCategory={selectedCategory} namespace="stats" />
				</div>
				<div className="header-right">{headerRight}</div>
			</div>
			<div className={"page-content"}>{children}</div>
		</section>
	);
};

export default PageContainer;
