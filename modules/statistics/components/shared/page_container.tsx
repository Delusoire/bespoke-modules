import { UI } from "/modules/stdlib/src/webpack/ComponentLibrary.ts";
import { categories, selectedCategoryCtx } from "../../app.tsx";

import { TopNavBar } from "/modules/stdlib/lib/components/MountedNavBar.tsx";

import { React } from "/modules/stdlib/src/expose/React.ts";

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
			<div className="page-header">
				<div className="header-left">
					<UI.Type as="h1" variant="canon" semanticColor="textBase">
						{title}
					</UI.Type>
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
