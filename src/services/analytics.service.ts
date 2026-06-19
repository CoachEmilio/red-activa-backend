import { PersonModel } from '../models/person.model';
import { ReportModel } from '../models/report.model';
import { SimilarityMatchModel } from '../models/similarity-match.model';

const byNeighborhood = async () => {
  const [nnByZone, reportsByZone] = await Promise.all([
    PersonModel.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$neighborhood', nn: { $sum: 1 } } },
    ]),
    ReportModel.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$neighborhood', reports: { $sum: 1 } } },
    ]),
  ]);

  const map = new Map<string, { neighborhood: string; nn: number; reports: number }>();

  for (const entry of nnByZone) {
    map.set(entry._id, { neighborhood: entry._id, nn: entry.nn, reports: 0 });
  }
  for (const entry of reportsByZone) {
    const existing = map.get(entry._id);
    if (existing) {
      existing.reports = entry.reports;
    } else {
      map.set(entry._id, { neighborhood: entry._id, nn: 0, reports: entry.reports });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.nn + b.reports - (a.nn + a.reports));
};

const heatmap = async () => {
  return PersonModel.aggregate([
    { $match: { deletedAt: null } },
    {
      $group: {
        _id: '$institution',
        count: { $sum: 1 },
        geoLocation: { $first: '$geoLocation' },
        neighborhood: { $first: '$neighborhood' },
        address: { $first: '$address' },
      },
    },
    {
      $lookup: {
        from: 'institutions',
        localField: '_id',
        foreignField: '_id',
        as: 'institution',
      },
    },
    { $unwind: '$institution' },
    {
      $project: {
        _id: 0,
        institutionId: '$_id',
        institutionName: '$institution.name',
        institutionType: '$institution.type',
        neighborhood: 1,
        address: 1,
        geoLocation: 1,
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);
};

const summary = async () => {
  const [personFacet, reportFacet, matchCount] = await Promise.all([
    PersonModel.aggregate([
      { $match: { deletedAt: null } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          byGender: [{ $group: { _id: '$gender', count: { $sum: 1 } } }],
        },
      },
    ]),
    ReportModel.aggregate([
      { $match: { deletedAt: null } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          byGender: [
            { $match: { gender: { $exists: true, $ne: null } } },
            { $group: { _id: '$gender', count: { $sum: 1 } } },
          ],
          byNeighborhood: [
            { $group: { _id: '$neighborhood', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ],
        },
      },
    ]),
    SimilarityMatchModel.countDocuments(),
  ]);

  const pf = personFacet[0];
  const rf = reportFacet[0];

  return {
    nn: {
      total: pf.total[0]?.count ?? 0,
      byStatus: Object.fromEntries(pf.byStatus.map((s: any) => [s._id, s.count])),
      byGender: Object.fromEntries(pf.byGender.map((g: any) => [g._id, g.count])),
    },
    reports: {
      total: rf.total[0]?.count ?? 0,
      byGender: Object.fromEntries(rf.byGender.map((g: any) => [g._id, g.count])),
      topNeighborhoods: rf.byNeighborhood,
    },
    matches: {
      total: matchCount,
    },
  };
};

export const analyticsService = { byNeighborhood, heatmap, summary };
