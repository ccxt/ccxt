<?php

namespace Elliptic\Curve\ShortCurve;

use BN\BN;

class JPoint extends \Elliptic\Curve\BaseCurve\Point
{
    public $x;
    public $y;
    public $z;
    public $zOne;

    function __construct($curve, $x, $y, $z)
    {
        parent::__construct($curve, "jacobian");

        if( $x == null && $y == null && $z == null )
        {
            $this->x = $this->curve->one;
            $this->y = $this->curve->one;
            $this->z = new BN(0);
        }
        else
        {
            $this->x = new BN($x, 16);
            $this->y = new BN($y, 16);
            $this->z = new BN($z, 16);
        }

        if( !$this->x->red )
            $this->x = $this->x->toRed($this->curve->red);
        if( !$this->y->red )
            $this->y = $this->y->toRed($this->curve->red);
        if( !$this->z->red )
            $this->z = $this->z->toRed($this->curve->red);

        return $this->zOne = $this->z == $this->curve->one;
    }

    public function toP()
    {
        if( $this->isInfinity() )
            return $this->curve->point(null, null);

        $zinv = $this->z->redInvm();
        $zinv2 = $zinv->redSqr();
        $ax = $this->x->redMul($zinv2);
        $ay = $this->y->redMul($zinv2)->redMul($zinv);

        return $this->curve->point($ax, $ay);
    }

    public function neg() {
        return $this->curve->jpoint($this->x, $this->y->redNeg(), $this->z);
    }

    public function add($p)
    {
        // O + P = P
        if( $this->isInfinity() )
            return $p;

        // P + O = P
        if( $p->isInfinity() )
            return $this;

        // 12M + 4S + 7A
        $pz2 = $p->z->redSqr();
        $z2 = $this->z->redSqr();
        $u1 = $this->x->redMul($pz2);
        $u2 = $p->x->redMul($z2);
        $s1 = $this->y->redMul($pz2->redMul($p->z));
        $s2 = $p->y->redMul($z2->redMul($this->z));

        $h = $u1->redSub($u2);
        $r = $s1->redSub($s2);

        if( $h->isZero() )
        {
            if( ! $r->isZero() )
                return $this->curve->jpoint(null, null, null);
            else
                return $this->dbl();
        }

        $h2 = $h->redSqr();
        $h3 = $h2->redMul($h);
        $v = $u1->redMul($h2);

        $nx = $r->redSqr()->redIAdd($h3)->redISub($v)->redISub($v);
        $ny = $r->redMul($v->redISub($nx))->redISub($s1->redMul($h3));
        $nz = $this->z->redMul($p->z)->redMul($h);

        return $this->curve->jpoint($nx, $ny, $nz);
    }

    public function mixedAdd($p)
    {
        // O + P = P
        if( $this->isInfinity() )
            return $p->toJ();

        // P + O = P
        if( $p->isInfinity() )
            return $this;

        // 8M + 3S + 7A
        $z2 = $this->z->redSqr();
        $u1 = $this->x;
        $u2 = $p->x->redMul($z2);
        $s1 = $this->y;
        $s2 = $p->y->redMul($z2)->redMul($this->z);

        $h = $u1->redSub($u2);
        $r = $s1->redSub($s2);

        if( $h->isZero() )
        {
            if( ! $r->isZero() )
                return $this->curve->jpoint(null, null, null);
            else
                return $this->dbl();
        }

        $h2 = $h->redSqr();
        $h3 = $h2->redMul($h);
        $v = $u1->redMul($h2);

        $nx = $r->redSqr()->redIAdd($h3)->redISub($v)->redISub($v);
        $ny = $r->redMul($v->redISub($nx))->redISub($s1->redMul($h3));
        $nz = $this->z->redMul($h);

        return $this->curve->jpoint($nx, $ny, $nz);
    }

    public function dblp($pow = null)
    {
        if( $pow == 0 || $this->isInfinity() )
            return $this;

        if( $pow == null )
            return $this->dbl();

        if( $this->curve->zeroA || $this->curve->threeA )
        {
            $r = $this;
            for($i = 0; $i < $pow; $i++)
                $r = $r->dbl();
            return $r;
        }

        // 1M + 2S + 1A + N * (4S + 5M + 8A)
        // N = 1 => 6M + 6S + 9A
        $jx = $this->x;
        $jy = $this->y;
        $jz = $this->z;
        $jz4 = $jz->redSqr()->redSqr();

        //Reuse results
        $jyd = $jy->redAdd($jy);
        for($i = 0; $i < $pow; $i++)
        {
            $jx2 = $jx->redSqr();
            $jyd2 = $jyd->redSqr();
            $jyd4 = $jyd2->redSqr();
            $c = $jx2->redAdd($jx2)->redIAdd($jx2)->redIAdd($this->curve->a->redMul($jz4));

            $t1 = $jx->redMul($jyd2);
            $nx = $c->redSqr()->redISub($t1->redAdd($t1));
            $t2 = $t1->redISub($nx);
            $dny = $c->redMul($t2);
            $dny = $dny->redIAdd($dny)->redISub($jyd4);
            $nz = $jyd->redMul($jz);
            if( ($i + 1) < $pow)
                $jz4 = $jz4->redMul($jyd4);

            $jx = $nx;
            $jz = $nz;
            $jyd = $dny;
        }

        return $this->curve->jpoint($jx, $jyd->redMul($this->curve->tinv), $jz);
    }

    public function dbl()
    {
        if( $this->isInfinity() )
            return $this;

        if( $this->curve->zeroA )
            return $this->_zeroDbl();
        elseif( $this->curve->threeA )
            return $this->_threeDbl();
        return $this->_dbl();
    }

    private function _zOneDbl($withA)
    {
        $xx = $this->x->redSqr();
        $yy = $this->y->redSqr();
        $yyyy = $yy->redSqr();

        // S = 2 * ((X1 + YY)^2 - XX - YYYY)
        $s = $this->x->redAdd($yy)->redSqr()->redISub($xx)->redISub($yyyy);
        $s = $s->redIAdd($s);

        // M = 3 * XX + a; a = 0
        $m = null;
        if( $withA )
            $m = $xx->redAdd($xx)->redIAdd($xx)->redIAdd($this->curve->a);
        else
            $m = $xx->redAdd($xx)->redIAdd($xx);

        // T = M ^ 2 - 2*S
        $t = $m->redSqr()->redISub($s)->redISub($s);

        $yyyy8 = $yyyy->redIAdd($yyyy);
        $yyyy8 = $yyyy8->redIAdd($yyyy8);
        $yyyy8 = $yyyy8->redIAdd($yyyy8);

        $ny = $m->redMul($s->redISub($t))->redISub($yyyy8);
        $nz = $this->y->redAdd($this->y);
        return $this->curve->jpoint($t, $ny, $nz);
    }

    private function _zeroDbl()
    {
        // Z = 1
        if( $this->zOne )
        {
            // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html
            //     #doubling-mdbl-2007-bl
            // 1M + 5S + 14A
            return $this->_zOneDbl(false);
        }

        // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html
        //     #doubling-dbl-2009-l
        // 2M + 5S + 13A

        $a = $this->x->redSqr();
        $b = $this->y->redSqr();
        $c = $b->redSqr();
        // D = 2 * ((X1 + B)^2 - A - C)
        $d = $this->x->redAdd($b)->redSqr()->redISub($a)->redISub($c);
        $d = $d->redIAdd($d);
        $e = $a->redAdd($a)->redIAdd($a);
        $f = $e->redSqr();

        $c8 = $c->redIAdd($c);
        $c8 = $c8->redIAdd($c8);
        $c8 = $c8->redIAdd($c8);

        // X3 = F - 2 * D
        $nx = $f->redISub($d)->redISub($d);
        // Y3 = E * (D - X3) - 8 * C
        $ny = $e->redMul($d->redISub($nx))->redISub($c8);
        // Z3 = 2 * Y1 * Z1
        $nz = $this->y->redMul($this->z);
        $nz = $nz->redIAdd($nz);

        return $this->curve->jpoint($nx, $ny, $nz);
    }

    private function _threeDbl()
    {
        if( $this->zOne )
        {
            // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-3.html
            //     #doubling-mdbl-2007-bl
            // 1M + 5S + 15A

            // XX = X1^2
            $xx = $this->x->redSqr();
            // YY = Y1^2
            $yy = $this->y->redSqr();
            // YYYY = YY^2
            $yyyy = $yy->redSqr();
            // S = 2 * ((X1 + YY)^2 - XX - YYYY)
            $s = $this->x->redAdd($yy)->redSqr()->redISub($xx)->redISub($yyyy);
            $s = $s->redIAdd($s);
            // M = 3 * XX + a
            $m = $xx->redAdd($xx)->redIAdd($xx)->redIAdd($this->curve->a);
            // T = M^2 - 2 * S
            $t = $m->redSqr()->redISub($s)->redISub($s);
            // X3 = T
            $nx = $t;
            // Y3 = M * (S - T) - 8 * YYYY
            $yyyy8 = $yyyy->redIAdd($yyyy);
            $yyyy8 = $yyyy8->redIAdd($yyyy8);
            $yyyy8 = $yyyy8->redIAdd($yyyy8);
            $ny = $m->redMul($s->redISub($t))->redISub($yyyy8);
            // Z3 = 2 * Y1
            $nz = $this->y->redAdd($this->y);
        } else {
            // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-3.html#doubling-dbl-2001-b
            // 3M + 5S

            // delta = Z1^2
            $delta = $this->z->redSqr();
            // gamma = Y1^2
            $gamma = $this->y->redSqr();
            // beta = X1 * gamma
            $beta = $this->x->redMul($gamma);
            // alpha = 3 * (X1 - delta) * (X1 + delta)
            $alpha = $this->x->redSub($delta)->redMul($this->x->redAdd($delta));
            $alpha = $alpha->redAdd($alpha)->redIAdd($alpha);
            // X3 = alpha^2 - 8 * beta
            $beta4 = $beta->redIAdd($beta);
            $beta4 = $beta4->redIAdd($beta4);
            $beta8 = $beta4->redAdd($beta4);
            $nx = $alpha->redSqr()->redISub($beta8);
            // Z3 = (Y1 + Z1)^2 - gamma - delta
            $nz = $this->y->redAdd($this->z)->redSqr()->redISub($gamma)->redISub($delta);

            $ggamma8 = $gamma->redSqr();
            $ggamma8 = $ggamma8->redIAdd($ggamma8);
            $ggamma8 = $ggamma8->redIAdd($ggamma8);
            $ggamma8 = $ggamma8->redIAdd($ggamma8);
            // Y3 = alpha * (4 * beta - X3) - 8 * gamma^2
            $ny = $alpha->redMul($beta4->redISub($nx))->redISub($ggamma8);
        }
        return $this->curve->jpoint($nx, $ny, $nz);
    }

    private function _dbl()
    {
        // 4M + 6S + 10A
        $jx = $this->x;
        $jy = $this->y;
        $jz = $this->z;
        $jz4 = $jz->redSqr()->redSqr();

        $jx2 = $jx->redSqr();
        $jy2 = $jy->redSqr();

        $c = $jx2->redAdd($jx2)->redIAdd($jx2)->redIAdd($this->curve->a->redMul($jz4));
        $jxd4 = $jx->redAdd($jx);
        $jxd4 = $jxd4->redIAdd($jxd4);
        $t1 = $jxd4->redMul($jy2);
        $nx = $c->redSqr()->redISub($t1->redAdd($t1));
        $t2 = $t1->redISub($nx);

        $jyd8 = $jy2->redSqr();
        $jyd8 = $jyd8->redIAdd($jyd8);
        $jyd8 = $jyd8->redIAdd($jyd8);
        $jyd8 = $jyd8->redIAdd($jyd8);

        $ny = $c->redMul($t2)->redISub($jyd8);
        $nz = $jy->redAdd($jy)->redMul($jz);

        return $this->curve->jpoint($nx, $ny, $nz);
    }

    public function trpl()
    {
        if( !$this->curve->zeroA )
            return $this->dbl()->add($this);

        // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html#tripling-tpl-2007-bl
        // 5M + 10S + ...

        $xx = $this->x->redSqr();
        $yy = $this->y->redSqr();
        $zz = $this->z->redSqr();
        // YYYY = YY^2
        $yyyy = $yy->redSqr();

        // M = 3 * XX + a * ZZ2; a = 0
        $m = $xx->redAdd($xx)->redIAdd($xx);
        // MM = M^2
        $mm = $m->redSqr();

        // E = 6 * ((X1 + YY)^2 - XX - YYYY) - MM
        $e = $this->x->redAdd($yy)->redSqr()->redISub($xx)->redISub($yyyy);
        $e = $e->redIAdd($e);
        $e = $e->redAdd($e)->redIAdd($e);
        $e = $e->redISub($mm);

        $ee = $e->redSqr();
        // T = 16*YYYY
        $t = $yyyy->redIAdd($yyyy);
        $t = $t->redIAdd($t);
        $t = $t->redIAdd($t);
        $t = $t->redIAdd($t);

        // U = (M + E)^2 - MM - EE - T
        $u = $m->redAdd($e)->redSqr()->redISub($mm)->redISub($ee)->redISub($t);

        $yyu4 = $yy->redMul($u);
        $yyu4 = $yyu4->redIAdd($yyu4);
        $yyu4 = $yyu4->redIAdd($yyu4);

        // X3 = 4 * (X1 * EE - 4 * YY * U)
        $nx = $this->x->redMul($ee)->redISub($yyu4);
        $nx = $nx->redIAdd($nx);
        $nx = $nx->redIAdd($nx);

        // Y3 = 8 * Y1 * (U * (T - U) - E * EE)
        $ny = $this->y->redMul($u->redMul($t->redISub($u))->redISub($e->redMul($ee)));
        $ny = $ny->redIAdd($ny);
        $ny = $ny->redIAdd($ny);
        $ny = $ny->redIAdd($ny);

        // Z3 = (Z1 + E)^2 - ZZ - EE
        $nz = $this->z->redAdd($e)->redSqr()->redISub($zz)->redISub($ee);

        return $this->curve->jpoint($nx, $ny, $nz);
    }

    public function mul($k, $kbase) {
        return $this->curve->_wnafMul($this, new BN($k, $kbase));
    }

    public function eq($p)
    {
        if( $p->type == "affine" )
            return $this->eq($p->toJ());

        if( $this == $p )
            return true;

        // x1 * z2^2 == x2 * z1^2
        $z2 = $this->z->redSqr();
        $pz2 = $p->z->redSqr();
        if( ! $this->x->redMul($pz2)->redISub($p->x->redMul($z2))->isZero() )
            return false;

        // y1 * z2^3 == y2 * z1^3
        $z3 = $z2->redMul($this->z);
        $pz3 = $pz2->redMul($p->z);

        return $this->y->redMul($pz3)->redISub($p->y->redMul($z3))->isZero();
    }

    public function eqXToP($x)
    {
        $zs = $this->z->redSqr();
        $rx = $x->toRed($this->curve->red)->redMul($zs);
        if( $this->x->cmp($rx) == 0 )
            return true;

        $xc = $x->_clone();
        $t = $this->curve->redN->redMul($zs);

        while(true)
        {
            $xc->iadd($this->curve->n);
            if( $xc->cmp($this->curve->p) >= 0 )
                return false;

            $rx->redIAdd($t);
            if( $this->x->cmp($rx) == 0 )
                return true;
        }
    }

    public function inspect()
    {
        if( $this->isInfinity() )
            return "<EC JPoint Infinity>";

        return "<EC JPoint x: " . $this->x->toString(16, 2) .
            " y: " . $this->y->toString(16, 2) .
            " z: " . $this->z->toString(16, 2) . ">";
    }

    public function __debugInfo() {
        return [
            "EC JPoint" => ($this->isInfinity() ?
                "Infinity" :
                [
                    "x" => $this->x->toString(16,2),
                    "y" => $this->y->toString(16,2),
                    "z" => $this->z->toString(16,2)
                ]
            )
        ];
    }

    public function isInfinity() {
        // XXX This code assumes that zero is always zero in red
        return $this->z->isZero();
    }
}

?>
