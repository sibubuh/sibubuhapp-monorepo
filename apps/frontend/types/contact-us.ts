import { ImageType } from './image'
import { AnchorImage, TextFieldType } from './shared'

export type ContactUsProps = {
  maps_url: string
  contact_title: string
  contact_details: AnchorImage[]
  form_title: string
  first_name: TextFieldType
  last_name: TextFieldType
  phone_number: TextFieldType
  email_address: TextFieldType
  message: TextFieldType
  submit_button: string
  submitting_label: string
}

export type SimpleContactProps = {
  text: string
  image: ImageType
}
