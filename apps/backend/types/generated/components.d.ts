import type { Schema, Struct } from '@strapi/strapi';

export interface CardCarouselHeroItem extends Struct.ComponentSchema {
  collectionName: 'components_card_carousel_hero_items';
  info: {
    description: '';
    displayName: 'CarouselHeroItem';
  };
  attributes: {
    content_title: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 1000;
      }>;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    link: Schema.Attribute.Component<'repeatable.carousel-cta', false>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface NavigationNavigationItem extends Struct.ComponentSchema {
  collectionName: 'components_navigation_navigation_items';
  info: {
    description: '';
    displayName: 'Navigation Item';
    icon: 'apps';
  };
  attributes: {
    sub_menus: Schema.Attribute.Component<'repeatable.anchor', true>;
    title: Schema.Attribute.Component<'repeatable.anchor', false>;
  };
}

export interface RepeatableAnchor extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_anchors';
  info: {
    description: '';
    displayName: 'Anchor';
    icon: 'code';
  };
  attributes: {
    href: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface RepeatableAnchorAndImagee extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_anchor_and_imagees';
  info: {
    description: '';
    displayName: 'Anchor & Image';
    icon: 'link';
  };
  attributes: {
    href: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    icon: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface RepeatableCarouselCta extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_carousel_ctas';
  info: {
    description: '';
    displayName: 'CarouselCta';
  };
  attributes: {
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    link: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    type: Schema.Attribute.Enumeration<['video', 'page']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'video'>;
  };
}

export interface RepeatableContactSupport extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_contact_supports';
  info: {
    description: '';
    displayName: 'Contact Support';
  };
  attributes: {
    block_detail: Schema.Attribute.Component<
      'repeatable.anchor-and-imagee',
      true
    >;
    description: Schema.Attribute.Blocks & Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface RepeatableDoubleAnchor extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_double_anchors';
  info: {
    description: '';
    displayName: 'Double Anchor';
    icon: 'bulletList';
  };
  attributes: {
    href: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    items: Schema.Attribute.Component<'repeatable.anchor', true>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface RepeatableDownloadItem extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_download_items';
  info: {
    description: '';
    displayName: 'DownloadItem';
    icon: 'attachment';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface RepeatableLabelAndValue extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_label_and_values';
  info: {
    description: '';
    displayName: 'Label & Value';
  };
  attributes: {
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    value: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface RepeatableRichText extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_rich_texts';
  info: {
    description: '';
    displayName: 'Rich Text';
    icon: 'book';
  };
  attributes: {
    address: Schema.Attribute.Blocks;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface RepeatableSharerUrl extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_sharer_urls';
  info: {
    description: '';
    displayName: 'SharerUrl';
  };
  attributes: {
    is_shown: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    prefix_url: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface RepeatableText extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_texts';
  info: {
    description: '';
    displayName: 'Text';
    icon: 'brush';
  };
  attributes: {
    text: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface RepeatableTextField extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_text_fields';
  info: {
    description: '';
    displayName: 'Text Field';
    icon: 'brush';
  };
  attributes: {
    error_text: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    placeholder: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface RepeatableTextImage extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_text_images';
  info: {
    description: '';
    displayName: 'Text Image';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    text: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface RepeatableTitleAndAnchor extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_title_and_anchors';
  info: {
    description: '';
    displayName: 'Title & Anchor';
  };
  attributes: {
    anchor: Schema.Attribute.Component<'repeatable.anchor', false>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface RepeatableTitleAndContent extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_title_and_contents';
  info: {
    description: '';
    displayName: 'Title & Content';
    icon: 'brush';
  };
  attributes: {
    content: Schema.Attribute.Blocks & Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface RepeatableTitleAndContentAndImage
  extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_title_and_content_and_images';
  info: {
    description: '';
    displayName: 'Title & Content & Image';
  };
  attributes: {
    content: Schema.Attribute.Blocks & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface RepeatableTitleAndDescription extends Struct.ComponentSchema {
  collectionName: 'components_repeatable_title_and_descriptions';
  info: {
    description: '';
    displayName: 'Title & Description';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 1000;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface SectionsAboutUs extends Struct.ComponentSchema {
  collectionName: 'components_sections_aboutuses';
  info: {
    description: '';
    displayName: 'AboutUs';
    icon: 'sun';
  };
  attributes: {
    banner: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    content: Schema.Attribute.Blocks & Schema.Attribute.Required;
    content2: Schema.Attribute.Blocks;
    maps_lottie: Schema.Attribute.Media<'files'>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface SectionsCompanyIntro extends Struct.ComponentSchema {
  collectionName: 'components_sections_company_intros';
  info: {
    description: '';
    displayName: 'WebIntro';
    icon: 'puzzle';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 1000;
      }>;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    link: Schema.Attribute.Component<'repeatable.anchor', false>;
    secondary_title: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface SectionsContactUs extends Struct.ComponentSchema {
  collectionName: 'components_sections_contactuses';
  info: {
    description: '';
    displayName: 'ContactUs';
    icon: 'envelop';
  };
  attributes: {
    contact_title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    email_address: Schema.Attribute.Component<'repeatable.text-field', false> &
      Schema.Attribute.Required;
    first_name: Schema.Attribute.Component<'repeatable.text-field', false> &
      Schema.Attribute.Required;
    form_title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    items: Schema.Attribute.Component<'repeatable.anchor-and-imagee', true>;
    last_name: Schema.Attribute.Component<'repeatable.text-field', false> &
      Schema.Attribute.Required;
    maps_url: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 1000;
      }>;
    message: Schema.Attribute.Component<'repeatable.text-field', false> &
      Schema.Attribute.Required;
    phone_number: Schema.Attribute.Component<'repeatable.text-field', false> &
      Schema.Attribute.Required;
    submit_label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    submitting_label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface SectionsFooter extends Struct.ComponentSchema {
  collectionName: 'components_sections_footers';
  info: {
    description: '';
    displayName: 'Footer';
    icon: 'shield';
  };
  attributes: {
    address: Schema.Attribute.Component<'repeatable.title-and-content', false> &
      Schema.Attribute.Required;
    contacts: Schema.Attribute.Component<'repeatable.title-and-anchor', true> &
      Schema.Attribute.Required;
    copyright: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    links: Schema.Attribute.Component<'repeatable.anchor', true>;
    logo: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface SectionsGroupedDownloadItem extends Struct.ComponentSchema {
  collectionName: 'components_sections_grouped_download_items';
  info: {
    description: '';
    displayName: 'GroupedDownloadItem';
    icon: 'dashboard';
  };
  attributes: {
    groups: Schema.Attribute.Component<'shared.group-download-items', true> &
      Schema.Attribute.Required;
  };
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heroes';
  info: {
    description: '';
    displayName: 'Hero';
  };
  attributes: {
    eyebrow: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    subtitle: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 1000;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface SectionsHeroAnchor extends Struct.ComponentSchema {
  collectionName: 'components_sections_hero_anchors';
  info: {
    description: '';
    displayName: 'HeroAnchor';
    icon: 'apps';
  };
  attributes: {
    action_text: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    slug: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface SectionsHeroHome extends Struct.ComponentSchema {
  collectionName: 'components_sections_hero_homes';
  info: {
    description: '';
    displayName: 'HeroHome';
    icon: 'grid';
  };
  attributes: {
    items: Schema.Attribute.Component<'card.carousel-hero-item', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
  };
}

export interface SectionsHeroPage extends Struct.ComponentSchema {
  collectionName: 'components_sections_hero_pages';
  info: {
    displayName: 'HeroPage';
  };
  attributes: {
    heropage: Schema.Attribute.Component<
      'repeatable.title-and-content-and-image',
      true
    >;
  };
}

export interface SectionsImage extends Struct.ComponentSchema {
  collectionName: 'components_sections_images';
  info: {
    displayName: 'Image';
    icon: 'picture';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface SectionsImageWithContent extends Struct.ComponentSchema {
  collectionName: 'components_sections_image_with_contents';
  info: {
    displayName: 'ImageWithContent';
    icon: 'calendar';
  };
  attributes: {
    content: Schema.Attribute.Blocks & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface SectionsInformationSupport extends Struct.ComponentSchema {
  collectionName: 'components_sections_information_supports';
  info: {
    description: '';
    displayName: 'InformationSupport';
    icon: 'gate';
  };
  attributes: {
    blocks: Schema.Attribute.Component<'repeatable.contact-support', true>;
  };
}

export interface SectionsLottie extends Struct.ComponentSchema {
  collectionName: 'components_sections_lotties';
  info: {
    displayName: 'Lottie';
    icon: 'crown';
  };
  attributes: {
    lottie: Schema.Attribute.Media<'files'> & Schema.Attribute.Required;
  };
}

export interface SectionsMultipleDownloadItem extends Struct.ComponentSchema {
  collectionName: 'components_sections_multiple_download_items';
  info: {
    description: '';
    displayName: 'MultipleDownloadItem';
    icon: 'apps';
  };
  attributes: {
    items: Schema.Attribute.Component<'repeatable.download-item', true> &
      Schema.Attribute.Required;
  };
}

export interface SectionsNavbar extends Struct.ComponentSchema {
  collectionName: 'components_sections_navbars';
  info: {
    description: '';
    displayName: 'Navbar';
    icon: 'store';
  };
  attributes: {
    logo_black: Schema.Attribute.Media<'images' | 'files'> &
      Schema.Attribute.Required;
    logo_white: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    menu: Schema.Attribute.Component<'navigation.navigation-item', true>;
  };
}

export interface SectionsPartners extends Struct.ComponentSchema {
  collectionName: 'components_sections_partners';
  info: {
    description: '';
    displayName: 'Partners';
    icon: 'chartBubble';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 1000;
      }>;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    link: Schema.Attribute.Component<'repeatable.anchor', false> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface SectionsQuote extends Struct.ComponentSchema {
  collectionName: 'components_sections_quotes';
  info: {
    description: '';
    displayName: 'Quote';
    icon: 'handHeart';
  };
  attributes: {
    author: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    divider: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    role: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    text: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
  };
}

export interface SectionsRawHtml extends Struct.ComponentSchema {
  collectionName: 'components_sections_raw_htmls';
  info: {
    displayName: 'RawHtml';
    icon: 'code';
  };
  attributes: {
    content: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SectionsRichTextSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_rich_text_sections';
  info: {
    displayName: 'RichTextSection';
    icon: 'cup';
  };
  attributes: {
    content: Schema.Attribute.Blocks & Schema.Attribute.Required;
  };
}

export interface SectionsSitemap extends Struct.ComponentSchema {
  collectionName: 'components_sections_sitemaps';
  info: {
    description: '';
    displayName: 'Sitemap';
    icon: 'bulletList';
  };
  attributes: {
    sitemap_list: Schema.Attribute.Component<'repeatable.double-anchor', true>;
  };
}

export interface SectionsSubheadline extends Struct.ComponentSchema {
  collectionName: 'components_sections_subheadlines';
  info: {
    description: '';
    displayName: 'Subheadline';
    icon: 'apps';
  };
  attributes: {
    text: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 1000;
      }>;
  };
}

export interface SectionsTextHeadline extends Struct.ComponentSchema {
  collectionName: 'components_sections_text_headlines';
  info: {
    description: '';
    displayName: 'TextHeadline';
    icon: 'hashtag';
  };
  attributes: {
    divider: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    title: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface SectionsVisionMission extends Struct.ComponentSchema {
  collectionName: 'components_sections_vision_missions';
  info: {
    description: '';
    displayName: 'VisionMission';
  };
  attributes: {
    mission: Schema.Attribute.Component<'repeatable.text', true>;
    mission_label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    vision: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 1000;
      }>;
    vision_label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface SectionsWhistleblowing extends Struct.ComponentSchema {
  collectionName: 'components_sections_whistleblowings';
  info: {
    description: '';
    displayName: 'Whistleblowing';
    icon: 'information';
  };
  attributes: {
    blocks: Schema.Attribute.Component<'repeatable.text-image', true> &
      Schema.Attribute.Required;
    contact_title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    description1: Schema.Attribute.Blocks & Schema.Attribute.Required;
    description2: Schema.Attribute.Blocks & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface SharedGroupDownloadItems extends Struct.ComponentSchema {
  collectionName: 'components_shared_group_download_items';
  info: {
    description: '';
    displayName: 'GroupDownloadItems';
  };
  attributes: {
    items: Schema.Attribute.Component<'repeatable.download-item', true> &
      Schema.Attribute.Required;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'seo';
    icon: 'search';
  };
  attributes: {
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
        minLength: 50;
      }>;
    metaImage: Schema.Attribute.Media<'images'>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
  };
}

export interface SharedSocialMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_medias';
  info: {
    displayName: 'SocialMedia';
    icon: 'apps';
  };
  attributes: {
    description: Schema.Attribute.Blocks & Schema.Attribute.Required;
    link: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    thumbnail: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'card.carousel-hero-item': CardCarouselHeroItem;
      'navigation.navigation-item': NavigationNavigationItem;
      'repeatable.anchor': RepeatableAnchor;
      'repeatable.anchor-and-imagee': RepeatableAnchorAndImagee;
      'repeatable.carousel-cta': RepeatableCarouselCta;
      'repeatable.contact-support': RepeatableContactSupport;
      'repeatable.double-anchor': RepeatableDoubleAnchor;
      'repeatable.download-item': RepeatableDownloadItem;
      'repeatable.label-and-value': RepeatableLabelAndValue;
      'repeatable.rich-text': RepeatableRichText;
      'repeatable.sharer-url': RepeatableSharerUrl;
      'repeatable.text': RepeatableText;
      'repeatable.text-field': RepeatableTextField;
      'repeatable.text-image': RepeatableTextImage;
      'repeatable.title-and-anchor': RepeatableTitleAndAnchor;
      'repeatable.title-and-content': RepeatableTitleAndContent;
      'repeatable.title-and-content-and-image': RepeatableTitleAndContentAndImage;
      'repeatable.title-and-description': RepeatableTitleAndDescription;
      'sections.about-us': SectionsAboutUs;
      'sections.company-intro': SectionsCompanyIntro;
      'sections.contact-us': SectionsContactUs;
      'sections.footer': SectionsFooter;
      'sections.grouped-download-item': SectionsGroupedDownloadItem;
      'sections.hero': SectionsHero;
      'sections.hero-anchor': SectionsHeroAnchor;
      'sections.hero-home': SectionsHeroHome;
      'sections.hero-page': SectionsHeroPage;
      'sections.image': SectionsImage;
      'sections.image-with-content': SectionsImageWithContent;
      'sections.information-support': SectionsInformationSupport;
      'sections.lottie': SectionsLottie;
      'sections.multiple-download-item': SectionsMultipleDownloadItem;
      'sections.navbar': SectionsNavbar;
      'sections.partners': SectionsPartners;
      'sections.quote': SectionsQuote;
      'sections.raw-html': SectionsRawHtml;
      'sections.rich-text-section': SectionsRichTextSection;
      'sections.sitemap': SectionsSitemap;
      'sections.subheadline': SectionsSubheadline;
      'sections.text-headline': SectionsTextHeadline;
      'sections.vision-mission': SectionsVisionMission;
      'sections.whistleblowing': SectionsWhistleblowing;
      'shared.group-download-items': SharedGroupDownloadItems;
      'shared.seo': SharedSeo;
      'shared.social-media': SharedSocialMedia;
    }
  }
}
