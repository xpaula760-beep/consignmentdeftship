
import Image from "next/image";

export default function NewComp() {
	return (
		<section className="bg-white">
			<div className="mx-auto max-w-7xl px-4 py-12">
				<div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
					<div className="text-center md:text-left">
						<h2
							className="tracking-tight"
							style={{
								fontFamily: "Satoshi, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
								fontWeight: 700,
								color: 'rgb(37, 40, 54)',
								fontSize: '36px',
								lineHeight: '40px'
							}}
						>
                            Grow Your Business Globally
 						</h2>

						<p className="mt-4 text-base text-zinc-600 max-w-xl">
							Seling worldwide may sound like a pain, but we can help you to sell your products worldwide seamlessly. As your business grows, get connected to and integrate your dashboard with the best international couriers as you need them.
						</p>
					</div>

					<div className="mt-6 md:mt-0 flex justify-center md:justify-end">
						<Image
							src="https://res.cloudinary.com/dilkjlgrj/image/upload/v1770932108/grow-your-business.CmioZVr7_1_qzyzoc.svg"
							alt="Grow your business"
							width={480}
							height={320}
							className="w-full max-w-sm h-auto"
						/>
					</div>
				</div>
			</div>
		</section>
	);
}

