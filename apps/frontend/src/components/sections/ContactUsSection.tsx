import { useState } from "react";
import { motion } from "motion/react";
import type { ContactUsSection } from "../../types/sections/contact-us";
const baseURL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;
export default function ContactUsSectionComponent({
	maps_url,
	contact_title,
	form_title,
	submit_label,
	first_name,
	last_name,
	phone_number,
	email_address,
	message,
	items,
}: ContactUsSection) {
	const [formData, setFormData] = useState({
		first_name: "",
		last_name: "",
		phone_number: "",
		email_address: "",
		message: "",
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Form submitted:", formData);
	};

	return (
		<section className="py-24 md:py-32 px-6 bg-neutral-50">
			<div className="max-w-7xl mx-auto">
				<div className="grid lg:grid-cols-2 gap-16">
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
					>
						<h2 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-8">
							{contact_title}
						</h2>

						<div className="aspect-video rounded-3xl overflow-hidden mb-8">
							<iframe
								src={maps_url}
								className="w-full h-full border-0"
								allowFullScreen
								loading="lazy"
								title="Map Location"
							/>
						</div>

						{items && items.length > 0 && (
							<div className="grid grid-cols-2 gap-4">
								{items.map((item, index) => (
									<div key={index} className="flex items-center gap-4">
										<img
											src={baseURL + item.icon?.url}
											alt={item.title}
											className="w-12 h-12 object-contain"
										/>
										<span className="text-neutral-700 font-medium">
											{item.title}
										</span>
									</div>
								))}
							</div>
						)}
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
						className="bg-white p-8 md:p-12 rounded-3xl shadow-xl"
					>
						<h3 className="text-2xl font-bold text-neutral-900 mb-8">
							{form_title}
						</h3>

						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-neutral-700 mb-2">
										{first_name.label}
									</label>
									<input
										type="text"
										name="first_name"
										placeholder={first_name.placeholder}
										value={formData.first_name}
										onChange={handleChange}
										className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-neutral-700 mb-2">
										{last_name.label}
									</label>
									<input
										type="text"
										name="last_name"
										placeholder={last_name.placeholder}
										value={formData.last_name}
										onChange={handleChange}
										className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-neutral-700 mb-2">
									{phone_number.label}
								</label>
								<input
									type="tel"
									name="phone_number"
									placeholder={phone_number.placeholder}
									value={formData.phone_number}
									onChange={handleChange}
									className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-neutral-700 mb-2">
									{email_address.label}
								</label>
								<input
									type="email"
									name="email_address"
									placeholder={email_address.placeholder}
									value={formData.email_address}
									onChange={handleChange}
									className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-neutral-700 mb-2">
									{message.label}
								</label>
								<textarea
									name="message"
									placeholder={message.placeholder}
									value={formData.message}
									onChange={handleChange}
									rows={5}
									className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none resize-none"
								/>
							</div>

							<motion.button
								type="submit"
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-indigo-500 transition-colors"
							>
								{submit_label}
							</motion.button>
						</form>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
