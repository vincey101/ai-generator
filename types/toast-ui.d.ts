declare module '@toast-ui/react-image-editor' {
  import { Component } from 'react'
  
  interface ImageEditorProps {
    includeUI?: {
      loadImage?: {
        path: string
        name: string
      }
      theme?: object
      menu?: string[]
      initMenu?: string
      uiSize?: {
        width: string | number
        height: string | number
      }
      menuBarPosition?: string
    }
    cssMaxHeight?: number
    cssMaxWidth?: number
    selectionStyle?: {
      cornerSize?: number
      rotatingPointOffset?: number
    }
    usageStatistics?: boolean
  }

  export class ImageEditor extends Component<ImageEditorProps> {}
}
