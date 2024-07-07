

declare interface IDERIntegerParams {
    bigint?:any;
    int?:number;
    hex?:number;
}

declare class DERInteger {
    /**/
}

declare interface IDERIntegerConstructor {
    new(params:IDERIntegerParams):DERInteger;
}

declare class DERSequence {
    /**/
    public getEncodedHex():string;
}
declare interface IDERSequenceConstructor {
    new(params:{
        array:DERInteger[];
    }):DERSequence;
}


declare class DERObjectIdentifier {
    /**/
}
declare interface IDERObjectIdentifierConstructor {
    new(params:{
        oid?:string;
        hex?:string;
        name?:string;
    }|string):DERObjectIdentifier;
}


declare class DERNull {
    /**/
}
declare interface IDERNullConstructor {
    new():DERNull;
}


declare class DERBitString {
    /**/
}
declare interface IDERBitStringConstructor {
    new(params:{
        hex?:string;
        array?:boolean[];
        bin?:string;
    }|string):DERBitString;
}


declare interface Iasn1 {
    readonly DERInteger:IDERIntegerConstructor;

    readonly DERSequence:IDERSequenceConstructor;

    readonly DERObjectIdentifier:IDERObjectIdentifierConstructor;

    readonly DERNull:IDERNullConstructor;

    readonly DERBitString:IDERBitStringConstructor;
}

declare interface IKJUR {
    readonly asn1:Iasn1;
}


export const KJUR:IKJUR;
