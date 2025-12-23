import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CLASS_OPTIONS, MONTH_OPTIONS } from '@/lib/types';

interface FiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  classFilter: string;
  setClassFilter: (cls: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  monthFilter: string;
  setMonthFilter: (month: string) => void;
  showMonthFilter?: boolean;
}

const Filters = ({
  searchQuery,
  setSearchQuery,
  classFilter,
  setClassFilter,
  statusFilter,
  setStatusFilter,
  monthFilter,
  setMonthFilter,
  showMonthFilter = true,
}: FiltersProps) => {
  const { t } = useTranslation();

  const clearFilters = () => {
    setSearchQuery('');
    setClassFilter('all');
    setStatusFilter('all');
    setMonthFilter('all');
  };

  const hasFilters = searchQuery || classFilter !== 'all' || statusFilter !== 'all' || monthFilter !== 'all';

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchByName')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 input-focus bg-background border-input"
          />
        </div>

        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-background border-input">
            <SelectValue placeholder={t('filterByClass')} />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">{t('allClasses')}</SelectItem>
            {CLASS_OPTIONS.map((cls) => (
              <SelectItem key={cls} value={cls}>
                {t(cls)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36 bg-background border-input">
            <SelectValue placeholder={t('filterByStatus')} />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">{t('allStatus')}</SelectItem>
            <SelectItem value="paid">{t('paid')}</SelectItem>
            <SelectItem value="unpaid">{t('unpaid')}</SelectItem>
          </SelectContent>
        </Select>

        {showMonthFilter && (
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-background border-input">
              <SelectValue placeholder={t('filterByMonth')} />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">{t('allMonths')}</SelectItem>
              {MONTH_OPTIONS.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {t(month.key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Filters;