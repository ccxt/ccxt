#include <url.h>
#include <algorithm>
#include <cstdlib>
#include <iterator>
#include <sstream>
#include <cstdint>
#include <iostream>




namespace {

static const uint8_t tbl[256] = {
    0,0,0,0, 0,0,0,0,     // NUL SOH STX ETX  EOT ENQ ACK BEL
    0,0,0,0, 0,0,0,0,     // BS  HT  LF  VT   FF  CR  SO  SI
    0,0,0,0, 0,0,0,0,     // DLE DC1 DC2 DC3  DC4 NAK SYN ETB
    0,0,0,0, 0,0,0,0,     // CAN EM  SUB ESC  FS  GS  RS  US
    0x00,0x01,0x00,0x00, 0x01,0x20,0x01,0x01, // SP ! " #  $ % & '
    0x01,0x01,0x01,0x01, 0x01,0x01,0x01,0x08, //  ( ) * +  , - . /
    0x01,0x01,0x01,0x01, 0x01,0x01,0x01,0x01, //  0 1 2 3  4 5 6 7
    0x01,0x01,0x04,0x01, 0x00,0x01,0x00,0x10, //  8 9 : ;  < = > ?
    0x02,0x01,0x01,0x01, 0x01,0x01,0x01,0x01, //  @ A B C  D E F G
    0x01,0x01,0x01,0x01, 0x01,0x01,0x01,0x01, //  H I J K  L M N O
    0x01,0x01,0x01,0x01, 0x01,0x01,0x01,0x01, //  P Q R S  T U V W
    0x01,0x01,0x01,0x00, 0x00,0x00,0x00,0x01, //  X Y Z [  \ ] ^ _
    0x00,0x01,0x01,0x01, 0x01,0x01,0x01,0x01, //  ` a b c  d e f g
    0x01,0x01,0x01,0x01, 0x01,0x01,0x01,0x01, //  h i j k  l m n o
    0x01,0x01,0x01,0x01, 0x01,0x01,0x01,0x01, //  p q r s  t u v w
    0x01,0x01,0x01,0x00, 0x00,0x00,0x01,0x00, //  x y z {  | } ~ DEL
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0
};


inline bool is_char(char c, std::uint8_t mask) {
    return (tbl[static_cast<unsigned char>(c)]&mask) != 0;
}


inline bool is_chars(const char* s, const char* e, std::uint8_t mask) {
    while(s!=e)
        if (!is_char(*s++,mask))
            return false;
    return true;
}


inline bool is_alpha(char c) {
    return (c>='A'&&c<='Z')||(c>='a'&&c<='z');
}


inline bool is_num(char c) {
    return c>='0'&&c<='9';
}


inline bool is_alnum(char c) {
    return is_alpha(c)||is_num(c);
}


inline bool is_hexdigit(char c) {
    return is_num(c)||(c>='A'&&c<='F')||(c>='a'&&c<='f');
}


inline bool is_uint(const char *&s, const char *e, uint32_t max) {
    if (s==e || !is_num(*s))
        return false;
    const char *t=s;
    uint32_t val = *t++-'0';
    if (val)
        while(t!=e && is_num(*t))
           val=val*10+(*t++-'0');
    if (val>max)
        return false;
    s=t;
    return true;
}


inline char get_hex_digit(char c) {
    if (c>='0'&&c<='9')
        return c-'0';
    if (c>='A'&&c<='F')
        return c-'A'+10;
    if (c>='a'&&c<='f')
        return c-'a'+10;
    return -1;
}


inline void to_lower(std::string& s) {
    for(auto& c : s)
        if (c>='A' && c<='Z')
            c |= 0x20;
}


inline const char* find_first_of(const char *s, const char *e, const char *q) {
    for(; s!=e; ++s)
        for(const char *t=q; *t; ++t)
            if (*s==*t)
                return s;
    return e;
}


inline const char* find_char(const char *s, const char *e, const char c) {
    while (s!=e && *s!=c)
        ++s;
    return s;
}


inline bool is_scheme(const char *s, const char *e)
{
    if (!s||!e||s==e||!is_alpha(*s))
        return false;
    char c;
    while(++s!=e)
        if (!is_alnum(c=*s)&&c!='+'&&c!='-'&&c!='.')
            return false;
    return true;
}


inline bool is_scheme(const std::string &s) {
    return is_scheme(s.data(),s.data()+s.length());
}


std::string normalize_scheme(const char *b, const char *e) {
    std::string o(b,e-b);
    to_lower(o);
    return o;
}


inline bool is_ipv4(const char *s, const char *e) {
    size_t l=e-s;
    if (l<7 || l>254)
        return false;
    for (const char *p=s; p!=e; ++p)
        if (*p!='.'&&!is_num(*p))
            return false;
    return true;
}


inline bool is_ipv4(const std::string &s) {
    return is_ipv4(s.data(),s.data()+s.length());
}


inline bool is_valid_ipv4(const char *s, const char *e) {
    return is_uint(s,e,255) && s!=e && *s++=='.' &&
           is_uint(s,e,255) && s!=e && *s++=='.' &&
           is_uint(s,e,255) && s!=e && *s++=='.' &&
           is_uint(s,e,255) && s==e;
}


inline bool is_valid_ipv4(const std::string &s) {
    return is_valid_ipv4(s.data(),s.data()+s.length());
}


inline bool is_reg_name(const char *s, const char *e) {
    return is_chars(s, e, 0x01);
}


inline bool is_reg_name(const std::string &s) {
    return is_reg_name(s.data(),s.data()+s.length());
}


std::string normalize_reg_name(const std::string& s) {
    std::string o(s);
    to_lower(o); // see rfc 4343
    return o;
}


bool is_ipv6(const char *s, const char *e) {
    size_t l=e-s;
    if (l<2 || l>254)
        return false;
    for (const char *p=s; p!=e; ++p)
        if (*p!=':'&&*p!='.'&&!is_hexdigit(*p))
            return false;
    return true;
}


inline bool is_ipv6(const std::string &s) {
    return is_ipv6(s.data(),s.data()+s.length());
}


bool is_valid_ipv6(const char *s, const char *e) {
    if ((e-s)>39||(e-s)<2)
        return false;
    bool null_field=false;
    const char *b=s, *p=s;
    int nfields=0, ndigits=0;
    if (p[0]==':') {
        if (p[1]!=':')
            return false;
        null_field=true;
        b=(p+=2);
        if (p==e)
            return true;
    }
    while(p!=e) {
        if (*p=='.') {
            return ((!null_field&&nfields==6)||(null_field&&nfields<7))&&is_valid_ipv4(b, e);
        } else if (*p==':') {
            if (ndigits==0) {
                if (null_field)
                    return false;
                null_field=true;
            } else {
                ++nfields;
                ndigits=0;
            }
            b=++p;
        } else {
            if ((++ndigits>4) || !is_hexdigit(*p++))
                return false;
        }
    }
    if (ndigits>0)
        ++nfields;
    else {
        if (e[-1]==':') {
            if (e[-2]==':' && nfields<8)
                return true;
            return false;
        }
    }
    return (!null_field&&nfields==8)||(null_field&&nfields<8);
}


inline bool is_valid_ipv6(const std::string &s) {
    return is_valid_ipv6(s.data(),s.data()+s.length());
}


std::string normalize_IPv6(const char *s, const char *e) {
    if (!is_ipv6(s, e))
        throw Url::parse_error("IPv6 ["+std::string(s,e-s)+"] is invalid");
    if ((e-s)==2 && s[0]==':' && s[1]==':')
        return std::string(s,e-s);

    // Split IPv6 at colons
    const size_t token_size = 10;
    const char *p=s, *tokens[token_size];
    if (*p==':')
        ++p;
    if (e[-1]==':')
        --e;
    const char *b=p;
    size_t i=0;
    while (p!=e) {
        if (*p++==':') {
            if (i+1 >= token_size) {
                throw Url::parse_error("IPv6 ["+std::string(s,e-s)+"] is invalid");
            }
            tokens[i++]=b;
            b=p;
        }
    }
    if (i<8)
        tokens[i++]=b;
    tokens[i]=p;
    size_t ntokens=i;

    // Get IPv4 address which is normalized by default
    const char *ipv4_b=nullptr, *ipv4_e=nullptr;
    if ((tokens[ntokens]-tokens[ntokens-1])>5) {
        ipv4_b=tokens[ntokens-1];
        ipv4_e=tokens[ntokens];
        --ntokens;
    }

    // Decode the fields
    const size_t fields_size = 8;
    std::uint16_t fields[fields_size];
    size_t null_pos=8, null_len=0, nfields=0;
    for(size_t i=0; i<ntokens; ++i) {
        const char *p=tokens[i];
        if (p==tokens[i+1] || *p==':')
            null_pos=i;
        else {
            if (nfields >= fields_size) {
                throw Url::parse_error("IPv6 ["+std::string(s,e-s)+"] is invalid");
            }
            std::uint16_t field=get_hex_digit(*p++);
            while (p!=tokens[i+1] && *p!=':')
                field=(field<<4)|get_hex_digit(*p++);
            fields[nfields++]=field;
        }
    }
    i = nfields;
    nfields=(ipv4_b)?6:8;
    if (i<nfields) {
        if (i<null_pos) {
            throw Url::parse_error("IPv6 ["+std::string(s,e-s)+"] is invalid");
        }
        size_t last=nfields;
        if (i!=null_pos)
            do fields[--last]=fields[--i]; while (i!=null_pos);
        do fields[--last]=0; while (last!=null_pos);
    }

    // locate first longer sequence of zero
    i=null_len=0;
    null_pos=nfields;
    size_t first=0;
    for(;;) {
        while (i<nfields && fields[i]!=0)
            ++i;
        if (i==nfields)
            break;
        first=i;
        while (i<nfields && fields[i]==0)
            ++i;
        if ((i-first)>null_len) {
            null_pos=first;
            null_len=i-first;
        }
        if (i==nfields)
            break;
    }
    if (null_len==1) {
        null_pos=nfields;
        null_len=1;
    }

    // Encode normalized IPv6
    std::stringstream str;
    if (null_pos==0) {
        str << std::hex << ':';
        i=null_len;
    } else {
        str << std::hex << fields[0];
        for (i=1; i<null_pos; ++i)
            str << ':' << fields[i];
        if (i<nfields)
            str << ':';
        i+=null_len;
        if (i==8 && null_len!=0)
            str << ':';
    }
    for (; i<nfields; ++i)
        str << ':' << fields[i];
    if (ipv4_b)
        str << ':' << std::string(ipv4_b, ipv4_e-ipv4_b);

    return str.str();
}


inline std::string normalize_IPv6(const std::string &s) {
    return normalize_IPv6(s.data(),s.data()+s.length());
}


inline bool is_port(const char *s, const char *e) {
    return is_uint(s,e,65535) && s==e;
}


inline bool is_port(const std::string &s) {
    return is_port(s.data(),s.data()+s.length());
}


std::string normalize_path(const std::string& s) {
    if (s.empty())
        return s;
    std::string elem;
    std::vector<std::string> elems;
    std::stringstream si(s);

    while(!std::getline(si, elem, '/').eof()){
        if (elem=="" || elem==".")
            continue;
        if (elem=="..") {
            if (!elems.empty())
                elems.pop_back();
            continue;
        }
        elems.push_back(elem);
    }
    if (elem==".")
        elems.push_back("");
    else if (elem=="..") {
        if (!elems.empty())
            elems.pop_back();
    }
    else
        elems.push_back(elem);

    std::stringstream so;
    if (s[0]=='/')
        so << '/';
    if (!elems.empty()) {
        auto it=elems.begin(), end=elems.end();
        so << *it;
        while(++it!=end)
            so << '/' << *it;
    }
    return so.str();
}


std::string decode(const char *s, const char *e) {
    std::string o;
    o.reserve(e-s);
    while(s!=e) {
        char c=*s++, a, b;
        if (c=='%') {
            if (s==e || (a=get_hex_digit(*s++))<0 || s==e || (b=get_hex_digit(*s++))<0)
                throw Url::parse_error("Invalid percent encoding");
            c=(a<<4)|b;
        }
        o.push_back(c);
    }
    return o;
}


std::string decode_plus(const char *s, const char *e) {
    std::string o;
    o.reserve(e-s);
    while(s!=e) {
        char c=*s++, a, b;
        if (c=='+')
            c=' ';
        else if (c=='%') {
            if (s==e || (a=get_hex_digit(*s++))<0 || s==e || (b=get_hex_digit(*s++))<0)
                throw Url::parse_error("Invalid percent encoding");
            c=(a<<4)|b;
        }
        o.push_back(c);
    }
    return o;
}


class encode {
    public:
        encode(const std::string& s, std::uint8_t mask) : m_s(s), m_mask(mask) {}
    private:
        const std::string& m_s;
        std::uint8_t m_mask;
    friend std::ostream& operator<< (std::ostream& o, const encode& e) {
        for (const char c:e.m_s)
            if (is_char(c,e.m_mask))
                o<<c;
            else
                o<<'%'<<"0123456789ABCDEF"[((uint8_t)c)>>4]<<"0123456789ABCDEF"[((uint8_t)c)&0xF];
        return o;
    }
};


class encode_query_key {
    public:
        encode_query_key(const std::string& s, std::uint8_t mask) : m_s(s), m_mask(mask) {}
    private:
        const std::string& m_s;
        std::uint8_t m_mask;
    friend std::ostream& operator<< (std::ostream& o, const encode_query_key& e) {
        for (const char c:e.m_s)
            if (c==' ')
                o<<'+';
            else if (c=='+')
                o<<"%2B";
            else if (c=='=')
                o<<"%3D";
            else if (c=='&')
                o<<"%26";
            else if (c==';')
                o<<"%3B";
            else if (is_char(c,e.m_mask))
                o<<c;
            else
                o<<'%'<<"0123456789ABCDEF"[((uint8_t)c)>>4]<<"0123456789ABCDEF"[((uint8_t)c)&0xF];
        return o;
    }
};


class encode_query_val {
    public:
        encode_query_val(const std::string& s, std::uint8_t mask) : m_s(s), m_mask(mask) {}
    private:
        const std::string& m_s;
        std::uint8_t m_mask;
    friend std::ostream& operator<< (std::ostream& o, const encode_query_val& e) {
        for (const char c:e.m_s)
            if (c==' ')
                o<<'+';
            else if (c=='+')
                o<<"%2B";
            else if (c=='&')
                o<<"%26";
            else if (c==';')
                o<<"%3B";
            else if (is_char(c,e.m_mask))
                o<<c;
            else
                o<<'%'<<"0123456789ABCDEF"[((uint8_t)c)>>4]<<"0123456789ABCDEF"[((uint8_t)c)&0xF];
        return o;
    }
};



} // end of anonymous namnespace
// ---------------------------------------------------------------------


// Copy assignment
void Url::assign(const Url &url) {
    m_parse=url.m_parse;
    m_built=url.m_built;
    if (m_parse) {
        m_scheme=url.m_scheme;
        m_user=url.m_user;
        m_host=url.m_host;
        m_ip_v=url.m_ip_v;
        m_port=url.m_port;
        m_path=url.m_path;
        m_query=url.m_query;
        m_fragment=url.m_fragment;
    }
    if (!m_parse || m_built)
        m_url=url.m_url;
}


// Move assignment
void Url::assign(Url&& url) {
    m_parse=url.m_parse;
    m_built=url.m_built;
    if (m_parse) {
        m_scheme=std::move(url.m_scheme);
        m_user=std::move(url.m_user);
        m_host=std::move(url.m_host);
        m_ip_v=std::move(url.m_ip_v);
        m_port=std::move(url.m_port);
        m_path=std::move(url.m_path);
        m_query=std::move(url.m_query);
        m_fragment=std::move(url.m_fragment);
    }
    if (!m_parse || m_built)
        m_url=std::move(url.m_url);
}


Url &Url::scheme(const std::string& s) {
    if (!is_scheme(s))
        throw Url::parse_error("Invalid scheme '"+s+"'");
    lazy_parse();
    std::string o(s);
    to_lower(o);
    if (o!=m_scheme) {
        m_scheme=o;
        m_built=false;
        if ((m_scheme=="http" && m_port=="80") || (m_scheme=="https" && m_port=="443"))
            m_port="";
    }
    return *this;
}


Url &Url::user_info(const std::string& s) {
    if (s.length()>256)
        throw Url::parse_error("User info is longer than 256 characters '"+s+"'");
    lazy_parse();
    if (m_user!=s) {
        m_user=s;
        m_built=false;
    }
    return *this;
}


Url &Url::host(const std::string& h, std::uint8_t ip_v) {
    if (h.length()>253)
        throw Url::parse_error("Host is longer than 253 characters '"+h+"'");
    lazy_parse();
    std::string o;
    if (h.empty())
        ip_v=-1;
    else if (is_ipv4(h)) {
        if (!is_valid_ipv4(h))
            throw Url::parse_error("Invalid IPv4 address '"+h+"'");
        ip_v=4;
        o=h;
    } else if(ip_v!=0&&ip_v!=4&&ip_v!=6) {
        if (!is_ipv6(h)) {
            throw Url::parse_error("Invalid IPvFuture address '"+h+"'");
        }
        o=h;
    } else if (is_ipv6(h)) {
        if (!is_valid_ipv6(h))
            throw Url::parse_error("Invalid IPv6 address '"+h+"'");
        ip_v=6;
        o=normalize_IPv6(h);
    } else if (is_reg_name(h)) {
        ip_v=0;
        o=normalize_reg_name(h);
    } else
        throw Url::parse_error("Invalid host '"+h+"'");
    if (m_host!=o||m_ip_v!=ip_v) {
        m_host=o;
        m_ip_v=ip_v;
        m_built=false;
    }
    return *this;
}


Url &Url::port(const std::string& p) {
    if (!is_port(p))
        throw Url::parse_error("Invalid port '"+p+"'");
    lazy_parse();
    std::string o(p);
    if ((m_scheme=="http" && o=="80") || (m_scheme=="https" && o=="443"))
        o="";
    if (m_port!=o) {
        m_port=o;
        m_built=false;
    }
    return *this;
}


Url &Url::path(const std::string& p) {
    if (p.length()>8000)
        throw Url::parse_error("Path is longer than 8000 characters '"+p+"'");
    lazy_parse();
    std::string o(normalize_path(p));
    if (m_path!=o) {
        m_path=o;
        m_built=false;
    }
    return *this;
}


Url &Url::fragment(const std::string& f) {
    if (f.length()>256)
        throw Url::parse_error("Fragment is longer than 256 characters '"+f+"'");
    lazy_parse();
    if (m_fragment!=f) {
        m_fragment=f;
        m_built=false;
    }
    return *this;
}


Url &Url::clear() {
    m_url.clear();
    m_scheme.clear();
    m_user.clear();
    m_host.clear();
    m_port.clear();
    m_path.clear();
    m_query.clear();
    m_fragment.clear();
    m_ip_v=-1;
    m_built=true;
    m_parse=true;
    return *this;
}


void Url::parse_url() const {
    if (m_url.empty()) {
        const_cast<Url*>(this)->clear();
        m_parse=m_built=true;
        return;
    }
    if (m_url.length()>8000)
        throw Url::parse_error("URI is longer than 8000 characters");

    const char *s=m_url.data(), *e=s+m_url.length();
    std::int8_t ip_v=-1;
    const char *scheme_b, *scheme_e, *user_b, *user_e, *host_b, *host_e,
            *port_b, *port_e, *path_b, *path_e, *query_b, *query_e,
            *fragment_b, *fragment_e;
    scheme_b=scheme_e=user_b=user_e=host_b=host_e=port_b=port_e=path_b=
            path_e=query_b=query_e=fragment_b=fragment_e=nullptr;

    const char *b=s, *p=find_first_of(b, e, ":/?#");
    if (p==e) {
        if (!is_chars(b, p, 0x2F))
            throw Url::parse_error("Path '"+std::string(b,p)+"' in '"+std::string(s,e-s)+"' is invalid");
        path_b=b;
        path_e=e;
    } else {
        // get schema if any
        if (*p==':') {
            if (!is_scheme(b, p))
                throw Url::parse_error("Scheme in '"+std::string(s,e-s)+"' is invalid");
            scheme_b=b;
            scheme_e=p;
            p=find_first_of(b=p+1, e, "/?#");
        }
        // get authority if any
        if (p!=e && *p=='/' && (e-b)>1 && b[0]=='/' && b[1]=='/') {
            const char *ea=find_first_of(b+=2, e, "/?#"); // locate end of authority
            p=find_char(b, ea, '@');
            // get user info if any
            if (p!=ea) {
                if (!is_chars(b, p, 0x25))
                    throw Url::parse_error("User info in '"+std::string(s,e-s)+"' is invalid");
                user_b=b;
                user_e=p;
                b=p+1;
            }
            // Get IP literal if any
            if (*b=='[') {
                // locate end of IP literal
                p=find_char(++b, ea, ']');
                if (*p!=']')
                    throw Url::parse_error("Missing ] in '"+std::string(s,e-s)+"'");
                // decode IPvFuture protocol version
                if (*b=='v') {
                    if (is_hexdigit(*++b)) {
                        ip_v=get_hex_digit(*b);
                        if (is_hexdigit(*++b)) {
                            ip_v=(ip_v<<8)|get_hex_digit(*b);
                        }
                    }
                    if (ip_v==-1||*b++!='.'||!is_chars(b,p,0x05))
                        throw Url::parse_error("Host address in '"+std::string(s,e-s)+"' is invalid");
                } else if (is_ipv6(b,p)) {
                    ip_v=6;
                } else
                    throw Url::parse_error("Host address in '"+std::string(s,e-s)+"' is invalid");
                host_b=b;
                host_e=p;
                b=p+1;
            } else {
                p=find_char(b, ea, ':');
                if (is_ipv4(b, p))
                    ip_v=4;
                else if (is_reg_name(b, p))
                    ip_v=0;
                else
                    throw Url::parse_error("Host address in '"+std::string(s,e-s)+"' is invalid");
                host_b=b;
                host_e=p;
                b=p;
            }
            //get port if any
            if (b!=ea&&*b==':') {
                if (!is_port(++b, ea))
                    throw Url::parse_error("Port '"+std::string(b,ea-b)+"' in '"+std::string(s,e-s)+"' is invalid");
                port_b=b;
                port_e=ea;
            }
            b=ea;
        }
        p=find_first_of(b,e,"?#");
        if (!is_chars(b, p, 0x2F))
            throw Url::parse_error("Path '"+std::string(b,p)+"' in '"+std::string(s,e-s)+"' is invalid");
        path_b=b;
        path_e=p;
        if (p!=e && *p=='?') {
            p=find_char(b=p+1,e,'#');
            query_b=b;
            query_e=p;
        }
        if (p!=e && *p=='#') {
            if (!is_chars(p+1, e, 0x3F))
                throw Url::parse_error("Fragment '"+std::string(p+1,e)+"' in '"+std::string(s,e-s)+"' is invalid");
            fragment_b=p+1;
            fragment_e=e;
        }
    }
    std::string _scheme, _user, _host, _port, _path, _query, _fragment;
    Query query_v;

    if (scheme_b)
        _scheme=normalize_scheme(scheme_b, scheme_e);
    if (user_b)
        _user=decode(user_b, user_e);
    if (host_b) {
        _host=decode(host_b, host_e);
        if (ip_v==0)
            _host=normalize_reg_name(_host);
        else if (ip_v==6)
            _host=normalize_IPv6(_host);
    }
    if (port_b)
        _port=std::string(port_b,port_e-port_b);
    if (path_b)
        _path=normalize_path(decode(path_b, path_e));
    if (query_b) {
        _query=std::string(query_b, query_e);
        p=b=query_b;
        while (p!=query_e) {
            p=find_first_of(b, query_e, "=;&");
            if (!is_chars(b, p, 0x3F))
                throw Url::parse_error("Query key '"+std::string(b,p)+"' in '"+std::string(s,e-s)+"' is invalid");
            std::string key(decode_plus(b,p)), val;
            if (p!=query_e) {
                if (*p=='=') {
                    p=find_first_of(b=p+1, query_e, ";&");
                    if (!is_chars(b, p, 0x3F))
                        throw Url::parse_error("Query value '"+std::string(b,p)+"' in '"+std::string(s,e-s)+"' is invalid");
                    val=decode_plus(b,p);
                }
                b=p+1;
            }
            query_v.emplace_back(key, val);
        }
    }
    if (fragment_b)
        _fragment=decode(fragment_b, fragment_e);

    m_scheme=_scheme;
    m_user=_user;
    m_host=_host;
    m_ip_v=ip_v;
    m_port=_port;
    m_path=_path;
    m_query=query_v;
    m_fragment=_fragment;
    m_parse=true;
    m_built=false;
}


void Url::build_url() const {
    lazy_parse();
    std::stringstream url;
    if (!m_scheme.empty())
        url<<m_scheme<<":";
    if (!m_host.empty()) {
        url<<"//";
        if (!m_user.empty())
            url<<encode(m_user, 0x05)<<'@';
        if (m_ip_v==0||m_ip_v==4)
            url<<m_host;
        else if (m_ip_v==6)
            url<<"["<<m_host<<"]";
        else
            url<<"[v"<<std::hex<<(int)m_ip_v<<std::dec<<'.'<<m_host<<"]";
        if (!m_port.empty())
            if (!((m_scheme=="http"&&m_port=="80")||(m_scheme=="https"&&m_port=="443")))
                url<<":"<<m_port;
    } else {
        if (!m_user.empty())
            throw Url::build_error("User info defined, but host is empty");
        if (!m_port.empty())
            throw Url::build_error("Port defined, but host is empty");
        if (!m_path.empty()) {
            const char *b=m_path.data(), *e=b+m_path.length(), *p=find_first_of(b,e,":/");
            if (p!=e && *p==':')
                throw Url::build_error("The first segment of the relative path can't contain ':'");
        }
    }
    if (!m_path.empty()) {
        if (m_path[0]!='/'&&!m_host.empty())
            throw Url::build_error("Path must start with '/' when host is not empty");
        url<<encode(m_path, 0x0F);
    }
    if (!m_query.empty()) {
        url<<"?";
        auto it = m_query.begin(), end = m_query.end();
        if (it->key().empty())
            throw Url::build_error("First query entry has no key");
        url<<encode_query_key(it->key(), 0x1F);
        if (!it->val().empty())
            url<<"="<<encode_query_val(it->val(), 0x1F);
        while(++it!=end) {
            if (it->key().empty())
                throw Url::build_error("A query entry has no key");
            url<<"&"<<encode_query_key(it->key(), 0x1F);
            if (!it->val().empty())
                url<<"="<<encode_query_val(it->val(), 0x1F);
        }
    }
    if (!m_fragment.empty())
        url<<"#"<<encode(m_fragment, 0x1F);
    m_built=false;
    m_url=url.str();
}


// Output
std::ostream& Url::output(std::ostream &o) const {
    lazy_parse();
    if(!m_built) build_url();
    o<<"Url:{url("<<m_url<<")";
    if (!m_scheme.empty()) o << " scheme("<<m_scheme<<")";
    if (!m_user.empty()) o << " user_info("<<m_user<<")";
    if (m_ip_v!=-1) o << " host("<<m_host<<") IPv("<<(int)m_ip_v<<")";
    if (!m_port.empty()) o << " port("<<m_port<<")";
    if (!m_path.empty()) o << " path("<<m_path<<")";
    if (!m_query.empty()) {
        std::stringstream str;
        str<<" query(";
        for (const auto& q:m_query)
            str<<q;
        std::string s(str.str());
        o<<s.substr(0,s.length()-1)<<")";
    }
    if (!m_fragment.empty()) o << "fragment("<<m_fragment<<") ";
    o<<"}";
    return o;
}
