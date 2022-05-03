import Link from 'next/link'
import { useRouter } from 'next/router'

export default function SwitchLanguge () {
  const router = useRouter()
  return (<>
        <Link href={router.pathname} locale="en" >
          <a>English</a>
        </Link>
        <Link href={router.pathname} locale="de" >
          <a>Deutsch</a>
        </Link>
    </>)
}
